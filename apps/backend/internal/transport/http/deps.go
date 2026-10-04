package http

import (
	"portfolio-backend/internal/mail"
	"portfolio-backend/internal/objectstore"
	"portfolio-backend/internal/pdf"
	"portfolio-backend/internal/revalidate"

	"github.com/uptrace/bun"
)

type Dependencies struct {
	DB          *bun.DB
	Store       *objectstore.Store
	Mailer      *mail.Sender
	PDF         *pdf.Client
	Revalidator *revalidate.Client
}
