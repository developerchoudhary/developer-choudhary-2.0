package templates

import "embed"

// FS holds HTML templates for resume PDFs, transactional emails and the fonts
// shipped to Chromium (Gotenberg) so PDFs render identically everywhere.
//
//go:embed html/*.html email/*.html assets/fonts/*
var FS embed.FS
