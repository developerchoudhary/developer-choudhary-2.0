package mail

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"mime"
	"net"
	"net/smtp"
	"strings"
	"time"

	"portfolio-backend/internal/config"
)

type Attachment struct {
	Filename    string
	ContentType string
	Content     []byte
}

type Message struct {
	To          string
	ReplyTo     string
	Subject     string
	HTMLBody    string
	TextBody    string
	Attachments []Attachment
}

type Sender struct {
	host     string
	port     string
	username string
	password string
	from     string
}

// New builds an SMTP sender. Port 465 uses implicit TLS, everything else STARTTLS when offered.
func New() *Sender {
	return &Sender{
		host:     config.GetEnv("SMTP_HOST"),
		port:     config.GetEnvOrDefault("SMTP_PORT", "587"),
		username: config.GetEnv("SMTP_USERNAME"),
		password: config.GetEnv("SMTP_PASSWORD"),
		from:     config.GetEnv("SMTP_FROM"),
	}
}

func (s *Sender) Send(msg Message) error {
	to := strings.TrimSpace(msg.To)
	if to == "" {
		return fmt.Errorf("recipient email is required")
	}

	raw := s.build(msg, to)

	addr := net.JoinHostPort(s.host, s.port)
	auth := smtp.PlainAuth("", s.username, s.password, s.host)

	var client *smtp.Client
	tlsConfig := &tls.Config{ServerName: s.host, MinVersion: tls.VersionTLS12}

	if s.port == "465" {
		dialer := &net.Dialer{Timeout: 15 * time.Second}
		conn, err := tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("smtp dial: %w", err)
		}
		client, err = smtp.NewClient(conn, s.host)
		if err != nil {
			return fmt.Errorf("smtp client: %w", err)
		}
	} else {
		conn, err := net.DialTimeout("tcp", addr, 15*time.Second)
		if err != nil {
			return fmt.Errorf("smtp dial: %w", err)
		}
		client, err = smtp.NewClient(conn, s.host)
		if err != nil {
			return fmt.Errorf("smtp client: %w", err)
		}
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(tlsConfig); err != nil {
				return fmt.Errorf("smtp starttls: %w", err)
			}
		}
	}
	defer client.Close()

	if ok, _ := client.Extension("AUTH"); ok {
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}
	if err := client.Mail(fromAddress(s.from)); err != nil {
		return fmt.Errorf("smtp mail: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt: %w", err)
	}
	wc, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := wc.Write(raw); err != nil {
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := wc.Close(); err != nil {
		return fmt.Errorf("smtp close: %w", err)
	}
	return client.Quit()
}

func (s *Sender) build(msg Message, to string) []byte {
	var out bytes.Buffer
	mixed := fmt.Sprintf("mixed-%d", time.Now().UnixNano())
	alt := fmt.Sprintf("alt-%d", time.Now().UnixNano()+1)

	fmt.Fprintf(&out, "From: %s\r\n", s.from)
	fmt.Fprintf(&out, "To: %s\r\n", to)
	if strings.TrimSpace(msg.ReplyTo) != "" {
		fmt.Fprintf(&out, "Reply-To: %s\r\n", msg.ReplyTo)
	}
	fmt.Fprintf(&out, "Subject: %s\r\n", mime.QEncoding.Encode("utf-8", msg.Subject))
	fmt.Fprintf(&out, "Date: %s\r\n", time.Now().UTC().Format(time.RFC1123Z))
	fmt.Fprintf(&out, "MIME-Version: 1.0\r\n")

	hasAttachments := len(msg.Attachments) > 0
	if hasAttachments {
		fmt.Fprintf(&out, "Content-Type: multipart/mixed; boundary=%s\r\n\r\n", mixed)
		fmt.Fprintf(&out, "--%s\r\n", mixed)
	}

	fmt.Fprintf(&out, "Content-Type: multipart/alternative; boundary=%s\r\n\r\n", alt)
	text := msg.TextBody
	if strings.TrimSpace(text) == "" {
		text = "Please view this email in an HTML capable client."
	}
	fmt.Fprintf(&out, "--%s\r\n", alt)
	fmt.Fprintf(&out, "Content-Type: text/plain; charset=utf-8\r\n")
	fmt.Fprintf(&out, "Content-Transfer-Encoding: base64\r\n\r\n")
	writeBase64(&out, []byte(text))
	fmt.Fprintf(&out, "--%s\r\n", alt)
	fmt.Fprintf(&out, "Content-Type: text/html; charset=utf-8\r\n")
	fmt.Fprintf(&out, "Content-Transfer-Encoding: base64\r\n\r\n")
	writeBase64(&out, []byte(msg.HTMLBody))
	fmt.Fprintf(&out, "--%s--\r\n", alt)

	if hasAttachments {
		for _, att := range msg.Attachments {
			ct := att.ContentType
			if ct == "" {
				ct = "application/octet-stream"
			}
			fmt.Fprintf(&out, "--%s\r\n", mixed)
			fmt.Fprintf(&out, "Content-Type: %s\r\n", ct)
			fmt.Fprintf(&out, "Content-Disposition: attachment; filename=\"%s\"\r\n", att.Filename)
			fmt.Fprintf(&out, "Content-Transfer-Encoding: base64\r\n\r\n")
			writeBase64(&out, att.Content)
		}
		fmt.Fprintf(&out, "--%s--\r\n", mixed)
	}
	return out.Bytes()
}

func writeBase64(out *bytes.Buffer, data []byte) {
	encoded := make([]byte, base64.StdEncoding.EncodedLen(len(data)))
	base64.StdEncoding.Encode(encoded, data)
	for i := 0; i < len(encoded); i += 76 {
		end := i + 76
		if end > len(encoded) {
			end = len(encoded)
		}
		out.Write(encoded[i:end])
		out.WriteString("\r\n")
	}
}

// fromAddress extracts "addr" from `Name <addr>`.
func fromAddress(from string) string {
	if i := strings.LastIndex(from, "<"); i >= 0 {
		if j := strings.LastIndex(from, ">"); j > i {
			return strings.TrimSpace(from[i+1 : j])
		}
	}
	return strings.TrimSpace(from)
}
