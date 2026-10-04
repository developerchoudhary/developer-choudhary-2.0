package seed

import (
	"encoding/json"

	"portfolio-backend/internal/modules/education"
	"portfolio-backend/internal/modules/experience"
	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/services"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/modules/taglines"
)

var profileData = profile.UpdateRequest{
	FullName:           "Aman Choudhary",
	Headline:           "Full-stack engineer building websites, ERPs and CRMs for growing businesses",
	BioShort:           "I design and ship business software end to end: fast Next.js frontends, Go services, PostgreSQL, and the Kubernetes infrastructure that runs them on your own servers.",
	BioLong:            "I am a full-stack developer from Sri Ganganagar, Rajasthan. I started by building websites for local institutions and now architect production systems for companies in India and Australia: CRM portals, property platforms, ERP modules and marketing sites.\n\nMy work covers the whole stack. On the frontend I use Next.js, React and Tailwind to build fast, accessible interfaces. On the backend I write Go services with PostgreSQL, Redis and MinIO, and I run everything on self-hosted k3s clusters with GitOps deployments.\n\nI care about software that is simple to operate, cheap to run and easy to change. If you need a reliable partner for your next website, internal tool or customer portal, I would love to hear about it.",
	Email:              "contact@developerchoudhary.com",
	Phone:              "+91 95303 63236",
	Whatsapp:           "919530363236",
	LocationCity:       "Sri Ganganagar",
	LocationRegion:     "Rajasthan",
	LocationCountry:    "India",
	Timezone:           "Asia/Kolkata",
	AvatarURL:          "/aman-choudhary.jpg",
	AvailabilityStatus: "available",
	AvailabilityNote:   "Taking on new projects this quarter",
	YearsExperience:    3,
	ProjectsCompleted:  50,
	ClientsServed:      20,
	Socials: []profile.SocialLink{
		{Label: "GitHub", URL: "https://github.com/developerchoudhary", Icon: "github"},
		{Label: "Instagram", URL: "https://www.instagram.com/developer_choudhary/", Icon: "instagram"},
		{Label: "Facebook", URL: "https://www.facebook.com/DeveloperChoudhary", Icon: "facebook"},
		{Label: "WhatsApp", URL: "https://wa.me/919530363236", Icon: "whatsapp"},
	},
	ResumeSummary: "Full-stack engineer with hands-on experience shipping production CRM, ERP and real-estate platforms using Go, Next.js, PostgreSQL and Kubernetes. Comfortable owning architecture, infrastructure and delivery for small teams.",
}

type settingSeed struct {
	key         string
	value       any
	public      bool
	description string
}

var settingsData = []settingSeed{
	{"site.name", "Developer Choudhary", true, "Brand name used in titles and emails"},
	{"site.shortName", "DC", true, "Short wordmark"},
	{"seo.defaultTitle", "Developer Choudhary · Websites, ERP & CRM development", true, "Default <title>"},
	{"seo.defaultDescription", "Aman Choudhary builds high-performance websites, ERP systems and CRM portals with Next.js, Go and PostgreSQL, self-hosted on Kubernetes. Based in Rajasthan, working worldwide.", true, "Default meta description"},
	{"seo.keywords", []string{"web developer India", "Next.js developer", "Golang developer", "ERP development", "CRM development", "freelance full stack developer", "Sri Ganganagar"}, true, "Default keywords"},
	{"seo.twitterHandle", "@developer_jaat", true, "Twitter / X handle"},
	{"hero.eyebrow", "Independent full-stack engineer · India", true, "Small label above the hero title"},
	{"hero.ctaPrimary", map[string]string{"label": "Start a project", "href": "/contact"}, true, "Primary hero button"},
	{"hero.ctaSecondary", map[string]string{"label": "See the work", "href": "/work"}, true, "Secondary hero button"},
	{"contact.responseTime", "within one working day", true, "Promise shown on the contact page"},
	{"contact.calendarUrl", "", true, "Optional booking link (Cal.com / Calendly)"},
	{"features.blog", true, true, "Show the blog in navigation"},
	{"features.reviews", true, true, "Show reviews and allow submissions"},
	{"features.locationConsent", true, true, "Ask visitors to share their location"},
	{"features.resume", true, true, "Show the resume page"},
	{"analytics.gaId", "", true, "Google Analytics measurement id"},
	{"footer.note", "Designed and built by Aman Choudhary. Runs on Go, Next.js and a self-hosted k3s cluster.", true, "Footer sentence"},
}

var taglineData = []taglines.RequestDTO{
	{Text: "Websites that win customers.", Context: "hero"},
	{Text: "ERPs that run your operations.", Context: "hero"},
	{Text: "CRMs your team will actually use.", Context: "hero"},
	{Text: "Software you own, on servers you control.", Context: "hero"},
	{Text: "Have an idea or a messy spreadsheet? Let's turn it into software.", Context: "cta"},
	{Text: "Clear scope, fixed timelines, no surprises.", Context: "cta"},
}

func blocks(items ...map[string]any) json.RawMessage {
	out := make([]map[string]any, 0, len(items))
	for i, b := range items {
		b["id"] = string(rune('a' + i))
		out = append(out, b)
	}
	raw, _ := json.Marshal(out)
	return raw
}

func paragraph(text string) map[string]any {
	return map[string]any{"type": "paragraph", "data": map[string]any{"text": text}}
}

func heading(text string) map[string]any {
	return map[string]any{"type": "heading", "data": map[string]any{"level": 2, "text": text}}
}

func list(items ...string) map[string]any {
	return map[string]any{"type": "list", "data": map[string]any{"style": "unordered", "items": items}}
}

var serviceData = []services.RequestDTO{
	{
		Title: "Business websites", Tagline: "Fast, search-friendly sites that turn visitors into enquiries", Icon: "globe", IsFeatured: ptr(true),
		Summary: "Marketing sites, landing pages and multi-page company websites built with Next.js. Every page is optimised for Core Web Vitals and search engines from day one.",
		Description: blocks(
			paragraph("A website should be your best salesperson. I build sites that load in under a second, rank for the searches your customers make and make it effortless to get in touch."),
			heading("What you get"),
			list("Custom design, no templates", "Content you can edit yourself", "Technical SEO, structured data and sitemaps", "Analytics and lead capture wired in", "Hosting on your own server or Vercel"),
		),
		Deliverables:       []string{"Discovery workshop and sitemap", "Custom UI design", "Next.js build with CMS", "SEO setup and launch checklist", "30 days of post-launch support"},
		TechStack:          []string{"Next.js", "React", "Tailwind CSS", "TypeScript", "PostgreSQL"},
		IdealFor:           []string{"Local businesses", "Clinics and institutions", "Startups launching a product"},
		StartingPriceLabel: "From ₹25,000", TimelineLabel: "2–4 weeks",
		FAQs: []services.FAQ{
			{Question: "Can I update the content myself?", Answer: "Yes. Every site ships with an admin panel where you edit text, images, pages and SEO without touching code."},
			{Question: "Do you handle hosting and domains?", Answer: "I can host it on your VPS or a managed platform and set up DNS, SSL and backups for you."},
		},
	},
	{
		Title: "ERP systems", Tagline: "Operations software built around how your business actually works", Icon: "layers", IsFeatured: ptr(true),
		Summary: "Inventory, billing, accounts, HR and reporting modules designed for your workflows, with role-based access and audit trails.",
		Description: blocks(
			paragraph("Off-the-shelf ERPs force you to work their way. I build modular systems around your processes: start with the module that hurts the most, then grow."),
			heading("Typical modules"),
			list("Inventory and purchase management", "Invoicing, GST and payments", "Accounts and expense tracking", "HR, attendance and payroll", "Dashboards and exports"),
		),
		Deliverables:       []string{"Process mapping", "Data model and permissions design", "Go backend with PostgreSQL", "React admin interface", "Training and documentation"},
		TechStack:          []string{"Go", "PostgreSQL", "React", "Redis", "Docker", "Kubernetes"},
		IdealFor:           []string{"Manufacturers and traders", "Dairy and agri businesses", "Service companies with field teams"},
		StartingPriceLabel: "From ₹1,50,000", TimelineLabel: "6–12 weeks",
		FAQs: []services.FAQ{
			{Question: "Can it replace our existing software gradually?", Answer: "Yes. I design integrations and migrations so you can move one module at a time without downtime."},
		},
	},
	{
		Title: "CRM portals", Tagline: "Track every lead, client and conversation in one place", Icon: "users", IsFeatured: ptr(true),
		Summary: "Lead pipelines, client records, documents, agreements and automated follow-ups, built for sales and consulting teams.",
		Description: blocks(
			paragraph("I built an industry-grade CRM for an international migration consultancy: multi-office data scoping, agreements with PDF generation, file storage and real-time updates. I bring that experience to your team."),
			heading("Capabilities"),
			list("Lead capture from website and ads", "Pipeline stages and assignment rules", "Documents, e-sign ready agreements", "Email and WhatsApp notifications", "Reporting per office, agent or product"),
		),
		Deliverables:       []string{"Pipeline and permission design", "Go microservices and PostgreSQL", "React portal", "Integrations (email, WhatsApp, payments)", "Deployment on your cluster"},
		TechStack:          []string{"Go", "Spring Boot", "React", "GraphQL", "PostgreSQL", "MinIO"},
		IdealFor:           []string{"Consultancies and agencies", "Real-estate teams", "Education and immigration firms"},
		StartingPriceLabel: "From ₹1,20,000", TimelineLabel: "6–10 weeks",
	},
	{
		Title: "Custom web applications", Tagline: "Portals, marketplaces and dashboards tailored to your idea", Icon: "sparkles",
		Summary: "From property platforms to e-learning portals, I take products from idea to production with a clear scope and weekly demos.",
		Description: blocks(
			paragraph("You bring the idea and the domain knowledge; I bring architecture, delivery and the discipline to ship. Expect working software every week, not a big reveal at the end."),
		),
		Deliverables:       []string{"Product scoping and wireframes", "Full-stack build", "Payments, auth and notifications", "Admin panel", "Launch and monitoring"},
		TechStack:          []string{"Next.js", "Go", "Node.js", "PostgreSQL", "MongoDB", "Redis"},
		IdealFor:           []string{"Founders validating a product", "Businesses digitising a manual process"},
		StartingPriceLabel: "From ₹80,000", TimelineLabel: "4–10 weeks",
	},
	{
		Title: "APIs and backend systems", Tagline: "Reliable Go and Node services your apps can depend on", Icon: "server",
		Summary: "REST and GraphQL APIs, background jobs, file storage and integrations with payment gateways and third-party platforms.",
		Description: blocks(
			paragraph("Clean architecture, typed contracts, migrations and tests. I design backends that stay fast as data grows and are easy for the next developer to understand."),
		),
		Deliverables:       []string{"API design and documentation", "Go or Node implementation", "Database schema and migrations", "Auth, rate limiting and audit logs", "CI pipeline"},
		TechStack:          []string{"Go", "Gin", "Node.js", "PostgreSQL", "Redis", "MinIO", "GraphQL"},
		IdealFor:           []string{"Teams with a frontend that needs a solid backend", "Mobile apps needing an API"},
		StartingPriceLabel: "From ₹60,000", TimelineLabel: "3–6 weeks",
	},
	{
		Title: "DevOps and self-hosting", Tagline: "Own your infrastructure without the cloud bill", Icon: "cloud",
		Summary: "Kubernetes (k3s) clusters on affordable VPS servers with GitOps deployments, TLS, backups and monitoring.",
		Description: blocks(
			paragraph("I run production workloads on self-hosted k3s with ArgoCD, Traefik, cert-manager, MinIO and PostgreSQL. I can set the same up for you and teach your team to operate it."),
			list("Cluster setup and hardening", "CI/CD with GitHub Actions and ArgoCD", "Automated backups and restore drills", "Monitoring with Grafana", "Cost review and migration from cloud"),
		),
		Deliverables:       []string{"Infrastructure plan", "Cluster and ingress setup", "GitOps pipelines", "Backup and monitoring", "Runbook"},
		TechStack:          []string{"Kubernetes", "k3s", "ArgoCD", "Docker", "Traefik", "GitHub Actions", "Grafana"},
		IdealFor:           []string{"Teams paying too much for cloud", "Products needing data residency"},
		StartingPriceLabel: "From ₹40,000", TimelineLabel: "1–3 weeks",
	},
}

var skillData = []skills.RequestDTO{
	{Name: "Next.js", Category: "frontend", Proficiency: 92, Years: 3, Icon: "nextdotjs", IsFeatured: ptr(true)},
	{Name: "React", Category: "frontend", Proficiency: 92, Years: 3.5, Icon: "react", IsFeatured: ptr(true)},
	{Name: "TypeScript", Category: "frontend", Proficiency: 88, Years: 3, Icon: "typescript", IsFeatured: ptr(true)},
	{Name: "Tailwind CSS", Category: "frontend", Proficiency: 90, Years: 3, Icon: "tailwindcss"},
	{Name: "JavaScript", Category: "frontend", Proficiency: 94, Years: 4, Icon: "javascript"},
	{Name: "Go", Category: "backend", Proficiency: 85, Years: 1.5, Icon: "go", IsFeatured: ptr(true)},
	{Name: "Node.js", Category: "backend", Proficiency: 86, Years: 3, Icon: "nodedotjs", IsFeatured: ptr(true)},
	{Name: "Spring Boot", Category: "backend", Proficiency: 65, Years: 1, Icon: "springboot"},
	{Name: "GraphQL", Category: "backend", Proficiency: 78, Years: 1.5, Icon: "graphql"},
	{Name: "REST APIs", Category: "backend", Proficiency: 92, Years: 3.5, Icon: ""},
	{Name: "WebSockets", Category: "backend", Proficiency: 75, Years: 1.5, Icon: ""},
	{Name: "PostgreSQL", Category: "database", Proficiency: 84, Years: 2, Icon: "postgresql", IsFeatured: ptr(true)},
	{Name: "MongoDB", Category: "database", Proficiency: 82, Years: 3, Icon: "mongodb"},
	{Name: "Redis", Category: "database", Proficiency: 78, Years: 1.5, Icon: "redis"},
	{Name: "Kubernetes (k3s)", Category: "devops", Proficiency: 78, Years: 1, Icon: "kubernetes", IsFeatured: ptr(true)},
	{Name: "Docker", Category: "devops", Proficiency: 85, Years: 2, Icon: "docker"},
	{Name: "ArgoCD", Category: "devops", Proficiency: 72, Years: 1, Icon: "argo"},
	{Name: "GitHub Actions", Category: "devops", Proficiency: 82, Years: 2, Icon: "githubactions"},
	{Name: "Traefik & cert-manager", Category: "devops", Proficiency: 74, Years: 1, Icon: "traefikproxy"},
	{Name: "MinIO", Category: "cloud", Proficiency: 76, Years: 1, Icon: "minio"},
	{Name: "Vercel", Category: "cloud", Proficiency: 85, Years: 3, Icon: "vercel"},
	{Name: "Git", Category: "tools", Proficiency: 90, Years: 4, Icon: "git"},
	{Name: "Figma", Category: "design", Proficiency: 72, Years: 2, Icon: "figma"},
	{Name: "SEO & Core Web Vitals", Category: "other", Proficiency: 85, Years: 3, Icon: ""},
}

var experienceData = []experience.RequestDTO{
	{
		Company: "PME Global", CompanyURL: "https://pmeglobal.com.au", Role: "Full-Stack Web Developer", EmploymentType: "full-time",
		Location: "Sri Ganganagar, Rajasthan", IsRemote: true, StartedAt: "2025-08-01", IsCurrent: true,
		Summary: "Own the engineering of a multi-office CRM portal, the public website and a property platform for an Australian migration consultancy.",
		Responsibilities: []string{
			"Architected a microservice CRM backend in Go (accounts, agreements, storage, dashboard) alongside a Spring Boot auth service",
			"Built the React CRM frontend and the Next.js marketing site with live data from the CRM",
			"Designed agreement generation with HTML templates, Gotenberg PDFs, MinIO storage and email delivery",
			"Run the production k3s cluster: ArgoCD image updaters, Traefik, cert-manager, PostgreSQL and MinIO with scheduled backups",
			"Built and maintain oparealestate.com, a property platform with a super-admin panel",
		},
		Achievements: []string{
			"Launched oparealestate.com and pmeglobal.com.au to production",
			"Replaced ad-hoc Docker/PM2 hosting with GitOps on Kubernetes",
			"Introduced office-scoped permissions and audit logging across services",
		},
		Technologies: []string{"Go", "React", "Next.js", "Spring Boot", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "MinIO", "Kubernetes", "ArgoCD", "Docker"},
	},
	{
		Company: "Seth G.L. Bihani Shiksha Trust", Role: "Full-Stack Web Developer", EmploymentType: "full-time",
		Location: "Sri Ganganagar, Rajasthan", StartedAt: "2024-01-01", EndedAt: ptr("2025-07-31"),
		Summary: "Led web development for a group of educational institutions.",
		Responsibilities: []string{
			"Built seven dynamic institution websites with Next.js and a shared content system",
			"Maintained six legacy .NET websites while migrating content",
			"Worked with faculty and administration to gather requirements and ship on schedule",
		},
		Achievements: []string{
			"Cut page load times by roughly 40% through image optimisation and server rendering",
			"Improved search rankings with structured data and technical SEO",
			"Delivered a user-friendly CMS used daily by non-technical staff",
		},
		Technologies: []string{"Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "MongoDB"},
	},
}

var educationData = []education.RequestDTO{
	{
		Institution: "Seth G.L. Bihani S.D. (P.G.) College", Degree: "Bachelor of Computer Applications (BCA)", Field: "Computer Science",
		Location: "Sri Ganganagar, Rajasthan", StartedAt: date(2021, 7), EndedAt: date(2024, 6),
		Description: "Foundations in programming, databases, networking and software engineering.",
	},
}

var projectData = []projects.RequestDTO{
	{
		Title: "Online Property Agent", Subtitle: "Property platform with super-admin panel", ProjectType: "web-app", ClientName: "OPA Real Estate", ClientIndustry: "Real estate",
		Summary: "Search, filter and list properties for sale and rent across Australia, with an admin panel for agents and a Go backend tuned for fast listings.",
		LiveURL: "https://oparealestate.com/", Role: "Architecture, backend, frontend, deployment", IsFeatured: ptr(true),
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1764389254/Screenshot_2025-11-29_at_9.37.12_AM_svcmr0.png",
		Technologies: []string{"Next.js", "Go", "MongoDB", "Redis", "Docker", "React", "Tailwind CSS"},
		ServiceSlugs: []string{"custom-web-applications", "apis-and-backend-systems"},
		Highlights:   []projects.Highlight{{Label: "Listings served", Value: "1,000+"}, {Label: "Time to first byte", Value: "<200 ms"}},
		StartedAt:    date(2025, 9), CompletedAt: date(2025, 11),
	},
	{
		Title: "PME Global website", Subtitle: "Migration consultancy site fed by the CRM", ProjectType: "website", ClientName: "PME Global", ClientIndustry: "Migration & education",
		Summary: "A Next.js site for an Australian migration consultancy with course search, visa guides and enquiry forms that create leads directly in the CRM.",
		LiveURL: "https://pmeglobal.com.au/", Role: "Design system, frontend, integrations", IsFeatured: ptr(true),
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1764389319/Screenshot_2025-11-29_at_9.38.24_AM_uikh7i.png",
		Technologies: []string{"Next.js", "Tailwind CSS", "Ant Design", "GraphQL", "REST API"},
		ServiceSlugs: []string{"business-websites"},
		StartedAt:    date(2025, 8), CompletedAt: date(2025, 10),
	},
	{
		Title: "PME CRM portal", Subtitle: "Multi-office CRM with agreements, accounts and storage", ProjectType: "crm", ClientName: "PME Global", ClientIndustry: "Migration & education",
		Summary: "Internal CRM for counsellors and sub-agents: leads, clients, agreements with PDF generation, invoices, commissions and file storage, deployed on k3s with GitOps.",
		Role:    "Lead engineer: Go services, k8s, React", IsFeatured: ptr(true), Status: "in-progress",
		Technologies: []string{"Go", "Spring Boot", "React", "GraphQL", "PostgreSQL", "MinIO", "Kubernetes", "ArgoCD"},
		ServiceSlugs: []string{"crm-portals", "devops-and-self-hosting"},
		Highlights:   []projects.Highlight{{Label: "Services", Value: "5 backends"}, {Label: "Offices", Value: "Multi-tenant"}},
		StartedAt:    date(2025, 8),
	},
	{
		Title: "StudyNexaa", Subtitle: "E-learning platform", ProjectType: "web-app", ClientIndustry: "Education",
		Summary: "Course management, progress tracking and interactive learning materials built with Next.js and TypeScript.",
		LiveURL: "https://studynexaa.vercel.app/", RepoURL: "https://github.com/developerchoudhary/studynexaa",
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1730052031/duzrubbu4pb5kjz68lp6.png",
		Technologies: []string{"Next.js", "TypeScript", "Tailwind CSS", "MongoDB", "Node.js"},
		ServiceSlugs: []string{"custom-web-applications"}, CompletedAt: date(2024, 10),
	},
	{
		Title: "Jai Shree Equipment Dairy", Subtitle: "Dairy equipment e-commerce", ProjectType: "ecommerce", ClientName: "Jai Shree Equipment Dairy", ClientIndustry: "Dairy equipment",
		Summary:      "Product catalogue, order management and milk-collection system integration for a dairy equipment supplier.",
		LiveURL:      "https://jaishreeequipmentdairy.in",
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1730052035/ktn8avmr3wfhjogruxuz.png",
		Technologies: []string{"React", "Node.js", "Express", "MongoDB", "Stripe"},
		ServiceSlugs: []string{"business-websites", "erp-systems"}, CompletedAt: date(2024, 8),
	},
	{
		Title: "IndianMarket", Subtitle: "Online marketplace", ProjectType: "ecommerce", ClientIndustry: "Retail",
		Summary:      "Marketplace connecting local sellers with customers, with real-time chat and secure payments.",
		LiveURL:      "https://indianmarket.online/",
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1730052035/rj8vvweaabfdmv6tczbt.png",
		Technologies: []string{"React", "Node.js", "Socket.io", "MongoDB", "Redux"},
		ServiceSlugs: []string{"custom-web-applications"}, CompletedAt: date(2024, 5),
	},
	{
		Title: "Hthai Chat", Subtitle: "Real-time chat application", ProjectType: "web-app",
		Summary: "Secure real-time chat with authentication and message history.",
		LiveURL: "https://hthai.vercel.app/register", RepoURL: "https://github.com/developerchoudhary/hthai",
		CoverURL:     "https://res.cloudinary.com/dh7b09yai/image/upload/v1730052034/hyenoikem7br65fqgjo3.png",
		Technologies: []string{"Next.js", "Socket.io", "MongoDB", "JWT", "Tailwind CSS"},
		ServiceSlugs: []string{"custom-web-applications"}, CompletedAt: date(2024, 3),
	},
}

var upcomingProjectData = projects.RequestDTO{
	Title: "Open-source ERP starter", Subtitle: "A Go + Next.js foundation for small-business ERPs", ProjectType: "erp", ClientIndustry: "Open source",
	Summary: "Inventory, invoicing and accounts modules with role-based access, audit trails and a self-hosting guide. Built in public so clients can start from a proven base.",
	Role:    "Author", Status: "upcoming",
	Technologies: []string{"Go", "Next.js", "PostgreSQL", "Kubernetes"},
	ServiceSlugs: []string{"erp-systems", "devops-and-self-hosting"},
}

var categoryData = []posts.CategoryRequest{
	{Name: "Engineering", Description: "Go, Next.js, PostgreSQL and architecture notes", Color: "#0E7C66"},
	{Name: "Business software", Description: "ERPs, CRMs and digitising operations", Color: "#2563EB"},
	{Name: "DevOps", Description: "Kubernetes, self-hosting and deployments", Color: "#7C3AED"},
	{Name: "Journal", Description: "Lessons from projects and freelancing", Color: "#F2B33D"},
}
