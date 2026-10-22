# Nginx Server Visual

**An interactive, beginner-friendly visualization of NGINX on AWS EC2**  
Branding: **#BuildwithMohit**

A no-build-step learning project for AWS Cloud Support Engineer and DevOps beginners. Follow a request from a visitor's browser through internet networking and an EC2 security group to NGINX, then watch the server response return to the browser.

> **Brand and copyright note:** The preview uses the fictional name **StreamFlix** and original CSS-generated artwork. It is not affiliated with Netflix. It does not include Netflix source code, official logos, or copyrighted movie posters. Do not present it as an official streaming service.

## Features

- Nine clickable learning steps with auto-play every 5 seconds, Pause/Play, Reset, Previous, and Next.
- Animated SVG infrastructure diagram with request/response indicators.
- Interactive fictional streaming landing-page preview with hoverable poster cards.
- Dark/light theme toggle and responsive layout for mobile, tablet, and desktop.
- Copyable terminal/console checklist for each step.
- Plain-language analogies, technical explanations, and beginner-friendly troubleshooting.
- Static HTML, CSS, and JavaScript. No build step, framework, API key, or backend required.

## Project structure

```text
Nginx Server visual/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
├── .nojekyll
├── LICENSE
└── README.md
```

The `assets/` directory is intentionally available for your own original or properly licensed images. The current preview creates its artwork in CSS, so it works without external image files. The optional font import uses Google Fonts; system fallback fonts are provided if fonts cannot load.

## Run locally

1. Download or clone the repository.
2. Open `index.html` in a modern browser.
3. Click any numbered step, use Next/Previous, or pause auto-play.
4. Try the theme toggle and the fictional landing-page poster cards.

For a local HTTP preview (recommended), open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## AWS EC2 deployment — Amazon Linux 2023

These instructions deploy the static site on an EC2 instance. AWS may charge for resources; check current pricing and your Free Tier eligibility before launching.

### 1. Launch the instance

- Choose **Amazon Linux 2023**.
- Configure a key pair and a public IPv4 address (or another suitable access method).
- Attach a security group with:
  - **HTTP TCP 80** from `0.0.0.0/0` if the site should be public.
  - **SSH TCP 22** only from your trusted public IP, ideally `YOUR_PUBLIC_IP/32`.
- Ensure the subnet route table has a route to an Internet Gateway and the instance has a public address. A public IP alone is not enough if routing is missing.
- Never expose SSH to the whole internet for a normal lab.

### 2. Connect and install NGINX

From your local terminal, replace the placeholders:

```bash
chmod 400 my-key.pem
ssh -i my-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

On the EC2 instance:

```bash
sudo dnf update -y
sudo dnf install nginx -y
sudo systemctl enable --now nginx
sudo systemctl status nginx --no-pager
```

### 3. Upload the project

From your **local computer**, run this command in the folder that contains the project directory:

```bash
scp -i my-key.pem -r "Nginx Server visual/." ec2-user@YOUR_EC2_PUBLIC_IP:/home/ec2-user/nginx-visual/
```

Then SSH into EC2 and copy the site files into NGINX's document root:

```bash
sudo mkdir -p /usr/share/nginx/html
sudo cp -r /home/ec2-user/nginx-visual/. /usr/share/nginx/html/
sudo nginx -t
sudo systemctl reload nginx
```

If you cloned the GitHub repository directly on the instance instead, copy from the repository folder to `/usr/share/nginx/html/`. Avoid accidentally copying a parent folder so that `index.html` ends up nested one level too deep.

### 4. Test

On the instance:

```bash
curl -I http://localhost
sudo ss -lntp | grep ':80'
sudo tail -n 30 /var/log/nginx/access.log
sudo tail -n 30 /var/log/nginx/error.log
```

From your browser, open:

```text
http://YOUR_EC2_PUBLIC_IP/
```

This demo uses HTTP, not HTTPS. For production, configure a domain, TLS certificate, updates, logging, least-privilege access, and appropriate security controls.

## GitHub Pages deployment

GitHub Pages can host the **static interactive visualization** without AWS. It does not create an EC2 instance or demonstrate a real live AWS connection; the infrastructure diagram is a simulation.

1. Sign in to GitHub and create a new repository, for example `nginx-server-visual`.
2. Upload `index.html`, `css/`, `js/`, `.nojekyll`, `LICENSE`, and `README.md` to the repository root.
3. Commit the files to the default branch (usually `main`).
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then click **Save**.
7. Wait for GitHub Pages to publish. The URL will look like `https://YOUR_GITHUB_USERNAME.github.io/nginx-server-visual/`.
8. If you change files later, commit and push the changes; Pages will redeploy.

Because this is a static site, no Node.js install, npm command, or build step is needed. The `.nojekyll` file tells GitHub Pages not to apply Jekyll processing to the repository.

## JavaScript syntax check

If Node.js is installed, run:

```bash
node --check js/app.js
```

No output and an exit code of `0` means the JavaScript parses successfully. You can also open browser Developer Tools → Console to check for runtime errors.

## Nine learning steps

1. **AWS EC2** — launch an Amazon Linux 2023 virtual server.
2. **Security Group** — permit HTTP on port 80 and restricted SSH on port 22.
3. **Connect to EC2** — use SSH and the matching private key.
4. **Install NGINX** — `sudo dnf install nginx -y`.
5. **Start NGINX** — `sudo systemctl enable --now nginx`.
6. **Website files** — place HTML, CSS, JavaScript, and assets under `/usr/share/nginx/html/`.
7. **Browser request** — visitor sends HTTP to the public IP on port 80.
8. **NGINX response** — NGINX serves files and the browser renders them.
9. **Troubleshooting** — inspect security rules, routes, public IP, service status, listening ports, `curl`, and logs.

## Interview quick answers

- **What is NGINX?** A web server that can serve static files and also act as a reverse proxy or load balancer.
- **What is EC2?** AWS's virtual server service.
- **What is a security group?** A stateful virtual firewall attached to supported AWS resources.
- **What is port 80?** The standard port for unencrypted HTTP.
- **Why use `systemctl enable --now nginx`?** It starts NGINX immediately and configures it to start on boot.
- **What does `curl -I http://localhost` do?** It requests response headers from the local web server.
- **What does `sudo nginx -t` do?** It checks NGINX configuration syntax and referenced configuration files.
- **Where are common NGINX logs?** Usually `/var/log/nginx/access.log` and `/var/log/nginx/error.log` on this package setup.

## Troubleshooting matrix

| Symptom | What to check |
|---|---|
| Browser times out | Public IP, subnet route to Internet Gateway, security group TCP 80, network ACLs, instance state |
| `curl localhost` fails | NGINX service, configuration syntax, listening port, local firewall |
| `Connection refused` | Whether NGINX is running and listening on port 80 |
| `403 Forbidden` | File permissions, document root, NGINX configuration |
| `404 Not Found` | Requested path and file location |
| Page loads without styling | CSS path, browser Developer Tools, missing file requests |
| Old IP no longer works | Instance public IPv4 may have changed after stop/start |

## License

MIT for the project source authored here. Any assets you add separately must have their own compatible license and attribution where required.

---

**Built for learning by Mohit Gadilohar · #BuildwithMohit**
