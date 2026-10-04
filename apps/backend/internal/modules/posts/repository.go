package posts

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ListFilter struct {
	PublishedOnly bool
	PinFeatured   bool // featured ("pinned") posts first, before the requested sort
	CategorySlug  string
	TagSlug       string
}

type Repository interface {
	Create(ctx context.Context, item *Post, tagIDs []uuid.UUID) error
	Get(ctx context.Context, id uuid.UUID) (*Post, error)
	GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Post, error)
	List(ctx context.Context, query *pagination.ListQuery, filter ListFilter) ([]*Post, int, error)
	Related(ctx context.Context, exclude uuid.UUID, categoryID *uuid.UUID, limit int) ([]*Post, error)
	Update(ctx context.Context, item *Post, tagIDs []uuid.UUID) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error)
	IncrementView(ctx context.Context, id uuid.UUID) error
	PublishDue(ctx context.Context, now time.Time) ([]*Post, error)
	ListPublishedSlugs(ctx context.Context) ([]*Post, error)

	ListCategories(ctx context.Context) ([]*Category, error)
	GetCategory(ctx context.Context, id uuid.UUID) (*Category, error)
	GetCategoryBySlug(ctx context.Context, slug string) (*Category, error)
	CreateCategory(ctx context.Context, c *Category) error
	UpdateCategory(ctx context.Context, c *Category) error
	DeleteCategory(ctx context.Context, id, deletedBy uuid.UUID) error
	UniqueCategorySlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error)

	ListTags(ctx context.Context) ([]*Tag, error)
	GetTag(ctx context.Context, id uuid.UUID) (*Tag, error)
	GetTagBySlug(ctx context.Context, slug string) (*Tag, error)
	CreateTag(ctx context.Context, t *Tag) error
	UpdateTag(ctx context.Context, t *Tag) error
	DeleteTag(ctx context.Context, id, deletedBy uuid.UUID) error
	UniqueTagSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	db.RegisterModel((*PostTagLink)(nil))
	return &repo{db: db}
}

func (r *repo) withRelations(q *bun.SelectQuery) *bun.SelectQuery {
	return q.
		Relation("Category", func(sq *bun.SelectQuery) *bun.SelectQuery {
			return sq.Where("category.deleted_at IS NULL")
		}).
		Relation("Tags", func(sq *bun.SelectQuery) *bun.SelectQuery {
			return sq.Where("post_tags.deleted_at IS NULL").Order("post_tags.name ASC")
		})
}

func (r *repo) Create(ctx context.Context, item *Post, tagIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(item).Exec(ctx); err != nil {
			return err
		}
		return r.syncTags(ctx, tx, item.ID, tagIDs)
	})
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Post, error) {
	item := new(Post)
	err := r.withRelations(r.db.NewSelect().Model(item)).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("post not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Post, error) {
	item := new(Post)
	q := r.withRelations(r.db.NewSelect().Model(item)).
		Where("?TableAlias.slug = ?", slug).
		Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.status = ?", StatusPublished).Where("?TableAlias.published_at <= NOW()")
	}
	if err := q.Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("post not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery, filter ListFilter) ([]*Post, int, error) {
	var items []*Post
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if filter.PublishedOnly {
		q = q.Where("?TableAlias.status = ?", StatusPublished).Where("?TableAlias.published_at <= NOW()")
	}
	if filter.CategorySlug != "" {
		q = q.Join("JOIN post_categories AS pc ON pc.id = posts.category_id").Where("pc.slug = ?", filter.CategorySlug)
	}
	if filter.TagSlug != "" {
		q = q.Where("EXISTS (SELECT 1 FROM post_tag_links ptl JOIN post_tags pt ON pt.id = ptl.tag_id WHERE ptl.post_id = posts.id AND pt.slug = ?)", filter.TagSlug)
	}
	q = query.ApplyFilters(q, ListSchema)

	count, err := q.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	if filter.PinFeatured {
		q = q.OrderExpr("posts.is_featured DESC")
	}
	q = r.withRelations(query.ApplySort(q, ListSchema)).OrderExpr("posts.created_at DESC").Limit(query.Limit()).Offset(query.Offset())
	if err := q.Scan(ctx); err != nil {
		return nil, 0, err
	}
	return items, count, nil
}

// Related returns other published posts, same category first, then the newest.
func (r *repo) Related(ctx context.Context, exclude uuid.UUID, categoryID *uuid.UUID, limit int) ([]*Post, error) {
	var items []*Post
	q := r.withRelations(r.db.NewSelect().Model(&items)).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.status = ?", StatusPublished).
		Where("?TableAlias.published_at <= NOW()").
		Where("?TableAlias.id <> ?", exclude)
	if categoryID != nil {
		q = q.OrderExpr("(posts.category_id = ?) DESC", *categoryID)
	}
	err := q.OrderExpr("posts.published_at DESC").Limit(limit).Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Post, tagIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if err := shared.UpdateColumns(ctx, tx, item, item.ID, "post not found",
			"slug", "title", "excerpt", "content", "content_text", "cover_file_id", "cover_url", "cover_alt", "category_id",
			"status", "published_at", "scheduled_for", "reading_time_minutes", "is_featured", "seo_title", "seo_description",
			"canonical_url", "updated_by", "updated_at"); err != nil {
			return err
		}
		return r.syncTags(ctx, tx, item.ID, tagIDs)
	})
}

func (r *repo) syncTags(ctx context.Context, tx bun.Tx, postID uuid.UUID, tagIDs []uuid.UUID) error {
	if _, err := tx.NewDelete().Model((*PostTagLink)(nil)).Where("post_id = ?", postID).Exec(ctx); err != nil {
		return err
	}
	if len(tagIDs) == 0 {
		return nil
	}
	links := make([]*PostTagLink, 0, len(tagIDs))
	seen := map[uuid.UUID]bool{}
	for _, id := range tagIDs {
		if id == uuid.Nil || seen[id] {
			continue
		}
		seen[id] = true
		links = append(links, &PostTagLink{PostID: postID, TagID: id})
	}
	if len(links) == 0 {
		return nil
	}
	_, err := tx.NewInsert().Model(&links).Exec(ctx)
	return err
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Post](ctx, r.db, id, deletedBy, "post not found")
}

func (r *repo) UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error) {
	return shared.UniqueSlug[Post](ctx, r.db, base, excludeID)
}

func (r *repo) IncrementView(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewUpdate().Model((*Post)(nil)).
		Set("view_count = view_count + 1").
		Where("?TableAlias.id = ?", id).
		Exec(ctx)
	return err
}

// PublishDue flips scheduled posts whose time has come and returns them.
func (r *repo) PublishDue(ctx context.Context, now time.Time) ([]*Post, error) {
	var items []*Post
	err := r.db.NewUpdate().Model(&items).
		Set("status = ?", StatusPublished).
		Set("published_at = COALESCE(scheduled_for, ?)", now).
		Set("updated_at = ?", now).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.status = ?", StatusScheduled).
		Where("?TableAlias.scheduled_for <= ?", now).
		Returning("*").
		Scan(ctx)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	return items, nil
}

func (r *repo) ListPublishedSlugs(ctx context.Context) ([]*Post, error) {
	var items []*Post
	err := r.db.NewSelect().Model(&items).
		Column("slug", "updated_at", "published_at").
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.status = ?", StatusPublished).
		Where("?TableAlias.published_at <= NOW()").
		Order("published_at DESC").
		Scan(ctx)
	return items, err
}

// ---------------- categories ----------------

func (r *repo) ListCategories(ctx context.Context) ([]*Category, error) {
	var items []*Category
	err := r.db.NewSelect().Model(&items).
		ColumnExpr("post_categories.*").
		ColumnExpr("(SELECT COUNT(*) FROM posts p WHERE p.category_id = post_categories.id AND p.deleted_at IS NULL AND p.status = 'published') AS post_count").
		Where("?TableAlias.deleted_at IS NULL").
		Order("sort_order ASC", "name ASC").
		Scan(ctx)
	return items, err
}

func (r *repo) GetCategory(ctx context.Context, id uuid.UUID) (*Category, error) {
	return shared.FindByID[Category](ctx, r.db, id, "category not found")
}

func (r *repo) GetCategoryBySlug(ctx context.Context, slug string) (*Category, error) {
	item := new(Category)
	err := r.db.NewSelect().Model(item).Where("?TableAlias.slug = ?", slug).Where("?TableAlias.deleted_at IS NULL").Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("category not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) CreateCategory(ctx context.Context, c *Category) error {
	return shared.Insert(ctx, r.db, c)
}

func (r *repo) UpdateCategory(ctx context.Context, c *Category) error {
	return shared.UpdateColumns(ctx, r.db, c, c.ID, "category not found", "slug", "name", "description", "color", "sort_order", "updated_by", "updated_at")
}

func (r *repo) DeleteCategory(ctx context.Context, id, deletedBy uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewUpdate().Model((*Post)(nil)).Set("category_id = NULL").Where("category_id = ?", id).Exec(ctx); err != nil {
			return err
		}
		return shared.SoftDelete[Category](ctx, tx, id, deletedBy, "category not found")
	})
}

func (r *repo) UniqueCategorySlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error) {
	return shared.UniqueSlug[Category](ctx, r.db, base, excludeID)
}

// ---------------- tags ----------------

func (r *repo) ListTags(ctx context.Context) ([]*Tag, error) {
	var items []*Tag
	err := r.db.NewSelect().Model(&items).
		ColumnExpr("post_tags.*").
		ColumnExpr("(SELECT COUNT(*) FROM post_tag_links l JOIN posts p ON p.id = l.post_id WHERE l.tag_id = post_tags.id AND p.deleted_at IS NULL AND p.status = 'published') AS post_count").
		Where("?TableAlias.deleted_at IS NULL").
		Order("name ASC").
		Scan(ctx)
	return items, err
}

func (r *repo) GetTag(ctx context.Context, id uuid.UUID) (*Tag, error) {
	return shared.FindByID[Tag](ctx, r.db, id, "tag not found")
}

func (r *repo) GetTagBySlug(ctx context.Context, slug string) (*Tag, error) {
	item := new(Tag)
	err := r.db.NewSelect().Model(item).Where("?TableAlias.slug = ?", slug).Where("?TableAlias.deleted_at IS NULL").Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("tag not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) CreateTag(ctx context.Context, t *Tag) error {
	return shared.Insert(ctx, r.db, t)
}

func (r *repo) UpdateTag(ctx context.Context, t *Tag) error {
	return shared.UpdateColumns(ctx, r.db, t, t.ID, "tag not found", "slug", "name", "updated_by", "updated_at")
}

func (r *repo) DeleteTag(ctx context.Context, id, deletedBy uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewDelete().Model((*PostTagLink)(nil)).Where("tag_id = ?", id).Exec(ctx); err != nil {
			return err
		}
		return shared.SoftDelete[Tag](ctx, tx, id, deletedBy, "tag not found")
	})
}

func (r *repo) UniqueTagSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error) {
	return shared.UniqueSlug[Tag](ctx, r.db, base, excludeID)
}
