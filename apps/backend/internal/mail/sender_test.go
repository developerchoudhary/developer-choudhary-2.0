package mail

import (
	"strings"
	"testing"
)

func TestFromAddress(t *testing.T) {
	if got := fromAddress("Developer Choudhary <contact@developerchoudhary.com>"); got != "contact@developerchoudhary.com" {
		t.Fatalf("unexpected %q", got)
	}
	if got := fromAddress("plain@example.com"); got != "plain@example.com" {
		t.Fatalf("unexpected %q", got)
	}
}

func TestBuildMessage(t *testing.T) {
	s := &Sender{from: "Dev <dev@example.com>"}
	raw := string(s.build(Message{
		To:          "to@example.com",
		Subject:     "Hello",
		HTMLBody:    "<p>Hi</p>",
		TextBody:    "Hi",
		Attachments: []Attachment{{Filename: "resume.pdf", ContentType: "application/pdf", Content: []byte("%PDF-1.4")}},
	}, "to@example.com"))
	for _, want := range []string{"multipart/mixed", "multipart/alternative", "text/html", "application/pdf", "resume.pdf", "Subject: Hello"} {
		if !strings.Contains(raw, want) {
			t.Fatalf("message missing %q", want)
		}
	}
}
