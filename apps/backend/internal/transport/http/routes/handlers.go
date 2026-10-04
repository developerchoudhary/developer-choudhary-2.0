package routes

import (
	"portfolio-backend/internal/modules/auth"
	"portfolio-backend/internal/modules/certifications"
	"portfolio-backend/internal/modules/dashboard"
	"portfolio-backend/internal/modules/education"
	"portfolio-backend/internal/modules/experience"
	"portfolio-backend/internal/modules/files"
	"portfolio-backend/internal/modules/leads"
	"portfolio-backend/internal/modules/notifications"
	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/resumes"
	"portfolio-backend/internal/modules/reviews"
	"portfolio-backend/internal/modules/services"
	"portfolio-backend/internal/modules/settings"
	"portfolio-backend/internal/modules/site"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/modules/taglines"
	"portfolio-backend/internal/modules/users"
	"portfolio-backend/internal/modules/visits"
	"portfolio-backend/internal/objectstore"
	"portfolio-backend/internal/pdf"
	"portfolio-backend/internal/revalidate"

	"github.com/uptrace/bun"
)

type Infra struct {
	DB          *bun.DB
	Store       *objectstore.Store
	PDF         *pdf.Client
	Revalidator *revalidate.Client
}

type Handlers struct {
	Auth           *auth.Handler
	Users          *users.Handler
	Files          *files.Handler
	Profile        *profile.Handler
	Settings       *settings.Handler
	Taglines       *taglines.Handler
	Services       *services.Handler
	Skills         *skills.Handler
	Projects       *projects.Handler
	Experience     *experience.Handler
	Education      *education.Handler
	Certifications *certifications.Handler
	Posts          *posts.Handler
	Reviews        *reviews.Handler
	Leads          *leads.Handler
	Visits         *visits.Handler
	Resumes        *resumes.Handler
	Dashboard      *dashboard.Handler
	Site           *site.Handler
}

// Build wires repositories, services and handlers once at startup.
func Build(in Infra) *Handlers {
	db, rv := in.DB, in.Revalidator

	userRepo := users.NewRepository(db)
	userSvc := users.NewService(userRepo, db)
	authSvc := auth.NewService(userRepo, auth.NewSessionRepository(db), db)
	fileSvc := files.NewService(files.NewRepository(db), in.Store)
	notifySvc := notifications.NewService(db)

	profileSvc := profile.NewService(profile.NewRepository(db), db, rv)
	settingsSvc := settings.NewService(settings.NewRepository(db), db, rv)
	taglineSvc := taglines.NewService(taglines.NewRepository(db), db, rv)
	serviceSvc := services.NewService(services.NewRepository(db), db, rv)
	skillSvc := skills.NewService(skills.NewRepository(db), db, rv)
	projectSvc := projects.NewService(projects.NewRepository(db), db, rv)
	experienceSvc := experience.NewService(experience.NewRepository(db), db, rv)
	educationSvc := education.NewService(education.NewRepository(db), db, rv)
	certSvc := certifications.NewService(certifications.NewRepository(db), db, rv)
	postSvc := posts.NewService(posts.NewRepository(db), db, rv)
	reviewSvc := reviews.NewService(reviews.NewRepository(db), db, rv, notifySvc)
	leadSvc := leads.NewService(leads.NewRepository(db), db, notifySvc)
	visitSvc := visits.NewService(db)
	resumeSvc := resumes.NewService(db, resumes.Deps{
		Profile: profileSvc, Experience: experienceSvc, Education: educationSvc, Certifications: certSvc,
		Skills: skillSvc, Projects: projectSvc, Files: fileSvc, PDF: in.PDF, Revalidator: rv,
	})
	dashboardSvc := dashboard.NewService(db, leadSvc, reviewSvc, visitSvc, notifySvc)
	siteSvc := site.NewService(profileSvc, settingsSvc, taglineSvc, skillSvc, reviewSvc, projectSvc, postSvc, serviceSvc, resumeSvc)

	return &Handlers{
		Auth:           auth.NewHandler(authSvc),
		Users:          users.NewHandler(userSvc),
		Files:          files.NewHandler(fileSvc),
		Profile:        profile.NewHandler(profileSvc),
		Settings:       settings.NewHandler(settingsSvc),
		Taglines:       taglines.NewHandler(taglineSvc),
		Services:       services.NewHandler(serviceSvc),
		Skills:         skills.NewHandler(skillSvc),
		Projects:       projects.NewHandler(projectSvc),
		Experience:     experience.NewHandler(experienceSvc),
		Education:      education.NewHandler(educationSvc),
		Certifications: certifications.NewHandler(certSvc),
		Posts:          posts.NewHandler(postSvc),
		Reviews:        reviews.NewHandler(reviewSvc),
		Leads:          leads.NewHandler(leadSvc),
		Visits:         visits.NewHandler(visitSvc),
		Resumes:        resumes.NewHandler(resumeSvc),
		Dashboard:      dashboard.NewHandler(dashboardSvc),
		Site:           site.NewHandler(siteSvc),
	}
}
