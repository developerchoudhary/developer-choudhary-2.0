package objectstore

import (
	"context"
	"fmt"
	"io"
	"strings"

	"portfolio-backend/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Store struct {
	client *minio.Client
	bucket string
}

func New() (*Store, error) {
	endpoint := config.GetEnv("MINIO_ENDPOINT")
	accessKey := config.GetEnv("MINIO_ACCESS_KEY")
	secretKey := config.GetEnv("MINIO_SECRET_KEY")
	bucket := config.GetEnvOrDefault("MINIO_BUCKET", "portfolio")
	useSSL := strings.EqualFold(config.GetEnvOrDefault("MINIO_USE_SSL", "false"), "true")

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("minio client: %w", err)
	}

	return &Store{client: client, bucket: bucket}, nil
}

func (s *Store) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return fmt.Errorf("bucket exists: %w", err)
	}
	if exists {
		return nil
	}
	if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
		return fmt.Errorf("make bucket: %w", err)
	}
	return nil
}

func (s *Store) Put(ctx context.Context, objectKey string, reader io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, objectKey, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("put object: %w", err)
	}
	return nil
}

func (s *Store) Get(ctx context.Context, objectKey string) (*minio.Object, error) {
	obj, err := s.client.GetObject(ctx, s.bucket, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("get object: %w", err)
	}
	return obj, nil
}

func (s *Store) Remove(ctx context.Context, objectKey string) error {
	if err := s.client.RemoveObject(ctx, s.bucket, objectKey, minio.RemoveObjectOptions{}); err != nil {
		return fmt.Errorf("remove object: %w", err)
	}
	return nil
}
