(() => {
  "use strict";
  const steps = [
    {title:"Launch an AWS EC2 instance", kicker:"STEP 01 · CLOUD INFRASTRUCTURE", desc:"Think of EC2 as a computer you rent in the cloud. It will host the web server and website files.", caption:"Rent a computer in the cloud", text:"EC2 is a virtual server. Choose Amazon Linux 2023 and a suitable instance size, then assign a public IPv4 address if you want to reach it from the internet.", analogy:"EC2 is like renting a shop building where your website can operate.", icon:"☁", commandTitle:"Launch checklist", command:"1. Choose Amazon Linux 2023\n2. Select an instance type (for example, t3.micro if eligible)\n3. Create or select an SSH key pair\n4. Enable a public IPv4 address for this lab", note:"AWS console checklist. Instance eligibility and pricing depend on your account, region, and current AWS terms.", active:["nodeEC2"], port:"EC2"},
    {title:"Set the Security Group rules", kicker:"STEP 02 · NETWORK ACCESS", desc:"A security group is a virtual firewall. It decides which inbound connections can reach your instance.", caption:"The gatekeeper checks every visitor", text:"Add an inbound HTTP rule for TCP port 80 from the audience you intend to serve. Allow SSH (TCP 22) only from your trusted public IP, ideally as /32. Avoid opening SSH to everyone.", analogy:"Like a building's gate: customers use the public entrance, while maintenance access is restricted.", icon:"🛡", commandTitle:"Recommended inbound rules", command:"HTTP   TCP   80   Source: 0.0.0.0/0\nSSH    TCP   22   Source: YOUR_TRUSTED_PUBLIC_IP/32\n\n# Use ::/0 only if you intentionally serve IPv6 traffic", note:"Restrict SSH to your IP. Never expose SSH to 0.0.0.0/0 unless you fully understand the risk.", active:["nodeSecurity"], port:"TCP : 80"},
    {title:"Connect securely to EC2", kicker:"STEP 03 · SECURE ADMIN ACCESS", desc:"SSH lets you administer the Linux server remotely. Your key pair proves you are allowed to log in.", caption:"Open the server's maintenance door", text:"From a terminal, use the private key that matches the EC2 key pair and the correct default username for the AMI. On Amazon Linux, the common username is ec2-user.", analogy:"SSH is a private maintenance key; keep it safe and do not upload it to GitHub.", icon:"⌘", commandTitle:"SSH connection", command:"chmod 400 my-key.pem\nssh -i my-key.pem ec2-user@YOUR_EC2_PUBLIC_IP", note:"Run locally from your computer. Replace the key filename and public IP with your actual values.", active:["nodeEC2"], port:"SSH : 22"},
    {title:"Install NGINX", kicker:"STEP 04 · WEB SERVER SOFTWARE", desc:"NGINX is the software that listens for web requests and sends website files back to visitors.", caption:"Install the website's front desk", text:"Connect to your Amazon Linux 2023 instance, refresh package metadata, then install NGINX with DNF. The package manager downloads the software and its dependencies.", analogy:"NGINX is like a receptionist who knows where the website files are kept.", icon:"N", commandTitle:"Install NGINX", command:"sudo dnf update -y\nsudo dnf install nginx -y", note:"These commands are intended for Amazon Linux 2023. Other Linux distributions may use a different package manager.", active:["nodeEC2","nodeNginx"], port:"DNF"},
    {title:"Start and enable NGINX", kicker:"STEP 05 · RUN THE SERVICE", desc:"Install puts NGINX on the server. Starting it runs the service; enabling it starts the service after reboot.", caption:"Switch on the web server", text:"Use systemd to start NGINX now and enable it at boot. Verify that the service is active before testing it from your browser.", analogy:"Installing is unpacking the equipment; starting is turning it on; enabling is setting it to start automatically.", icon:"▶", commandTitle:"Start and verify", command:"sudo systemctl enable --now nginx\nsudo systemctl status nginx --no-pager\ncurl -I http://localhost", note:"A local HTTP response confirms NGINX is responding on the instance itself. It does not prove public networking is configured correctly.", active:["nodeEC2","nodeNginx"], port:"HTTP : 80"},
    {title:"Publish the website files", kicker:"STEP 06 · STATIC WEB CONTENT", desc:"NGINX needs an index file and its related styles, scripts, and images to display a complete landing page.", caption:"Put the page on the server shelf", text:"The default document root on many Amazon Linux NGINX packages is /usr/share/nginx/html/. Place index.html and any CSS, JavaScript, and image assets there, and confirm file permissions allow NGINX to read them.", analogy:"HTML is the page structure, CSS is the styling, JavaScript adds interactions, and images provide artwork.", icon:"▤", commandTitle:"Website document root", command:"cd /usr/share/nginx/html/\nls -la\n# Upload your files here, then verify index.html exists\nsudo nginx -t\nsudo systemctl reload nginx", note:"Back up or replace the default index file carefully. Use original or properly licensed assets.", active:["nodeEC2","nodeNginx"], port:"FILES"},
    {title:"Visitor sends an HTTP request", kicker:"STEP 07 · BROWSER TO SERVER", desc:"The visitor enters the EC2 public IPv4 address. The browser sends an HTTP request to port 80.", caption:"A visitor asks to see the homepage", text:"The request travels across the internet to the instance's public address. The security group checks the inbound rule, then the request can reach NGINX if routing and the service are configured correctly.", analogy:"A customer arrives at the building's public entrance and asks for the home page.", icon:"↗", commandTitle:"Test from your browser", command:"http://YOUR_EC2_PUBLIC_IP/\n\n# Or test from another terminal:\ncurl -I http://YOUR_EC2_PUBLIC_IP/", note:"Use the instance's current public IPv4 address. An address can change after stop/start unless you use an Elastic IP.", active:["nodeBrowser","nodeInternet","nodeSecurity","nodeEC2","nodeNginx"], port:"HTTP : 80"},
    {title:"NGINX returns the homepage", kicker:"STEP 08 · SERVER RESPONSE", desc:"NGINX finds the requested file and returns an HTTP response. The browser interprets the HTML, CSS, JavaScript, and images.", caption:"The page arrives in the visitor's browser", text:"For a static site, NGINX commonly serves index.html and then the browser requests linked assets. A successful response is not necessarily HTTPS: this lab uses HTTP on port 80.", analogy:"The receptionist finds the requested page, makes a copy, and hands it back to the visitor.", icon:"↩", commandTitle:"Expected quick checks", command:"curl -I http://localhost\n# Look for an HTTP status such as 200 OK\nsudo tail -n 20 /var/log/nginx/access.log\nsudo tail -n 20 /var/log/nginx/error.log", note:"A 200 response usually means the requested resource was served successfully. Browser developer tools can reveal missing CSS or image requests.", active:["nodeNginx","nodeBrowser"], port:"200 OK"},
    {title:"Troubleshoot the common issues", kicker:"STEP 09 · DIAGNOSIS", desc:"If the page does not load, check the network path first, then the service, files, and logs.", caption:"Trace the request one checkpoint at a time", text:"Confirm the public IP is current, the security group allows inbound TCP 80, the instance has a working public route, and NGINX is active. Then test localhost and inspect logs.", analogy:"If a delivery fails, check the address, gate, receptionist, and shelf in that order.", icon:"⌕", commandTitle:"Troubleshooting checklist", command:"sudo systemctl status nginx --no-pager\nsudo nginx -t\nsudo ss -lntp | grep ':80'\ncurl -I http://localhost\nsudo tail -n 50 /var/log/nginx/error.log\n\n# In AWS: verify SG TCP/80, public IP, route table + IGW", note:"Timeouts often point to networking or firewall rules; connection refused can mean no service is listening; 403/404 usually points to access or file/path configuration.", active:["nodeSecurity","nodeEC2","nodeNginx"], port:"CHECK"},
  ];
  const $ = id => document.getElementById(id);
  let current = 0, playing = true, timer = null, toastTimer = null;
  const navButtons = [...document.querySelectorAll(".step-link")];
  const nodes = ["nodeBrowser","nodeInternet","nodeSecurity","nodeEC2","nodeNginx"];
  function showToast(message) {
    const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }
  function render(index, announce=true) {
    current = (index + steps.length) % steps.length;
    const s = steps[current];
    $("stepCount").textContent = `${String(current+1).padStart(2,"0")} / 09`;
    ["stepKicker","stepTitle","stepDesc","captionTitle","captionText","analogyText","captionIcon","commandTitle","commandText","commandNote","diagramPort"].forEach((id,i)=>{
      const keys = ["kicker","title","desc","caption","text","analogy","icon","commandTitle","command","note","port"];
      $(id).textContent = s[keys[i]];
    });
    navButtons.forEach((b,i)=>{b.classList.toggle("active",i===current);b.setAttribute("aria-current",i===current?"step":"false")});
    nodes.forEach(id=>$(id).classList.toggle("is-active",s.active.includes(id)));
    const packet = $("packet"), back = $("packetBack");
    packet.style.display = current >= 6 && current <= 7 ? "" : "none";
    back.style.display = current === 7 ? "" : "none";
    const packetPositions = [180,258,467,582,713];
    const routeIndex = current < 2 ? 3 : current < 6 ? 4 : 0;
    packet.setAttribute("cx", current===6?180:current===7?790:packetPositions[routeIndex]);
    packet.setAttribute("cy", current===7?265:165);
    if (current === 6) packet.setAttribute("cx","180");
    if (current === 7) { packet.setAttribute("cx","790"); back.setAttribute("cx","790"); }
    if (announce) $("stepTitle").setAttribute("tabindex","-1");
  }
  function stopTimer(){ if(timer){clearInterval(timer);timer=null;} }
  function startTimer(){stopTimer();timer=setInterval(()=>{if(playing)render(current+1,false)},5000);}
  navButtons.forEach(b=>b.addEventListener("click",()=>{render(Number(b.dataset.step));startTimer()}));
  $("nextBtn").addEventListener("click",()=>{render(current+1);startTimer()});
  $("prevBtn").addEventListener("click",()=>{render(current-1);startTimer()});
  $("playBtn").addEventListener("click",()=>{playing=!playing;$("playBtn").textContent=playing?"Ⅱ Pause":"▶ Play";if(playing)startTimer();else stopTimer();if(playing)startTimer();showToast(playing?"Auto-play resumed":"Auto-play paused")});
  $("resetBtn").addEventListener("click",()=>{playing=true;$("playBtn").textContent="Ⅱ Pause";render(0);startTimer();showToast("Learning path reset to step 1")});
  $("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");showToast(document.body.classList.contains("light")?"Light theme enabled":"Dark theme enabled")});
  $("copyCommand").addEventListener("click",async()=>{
    const text=$("commandText").textContent;
    try { await navigator.clipboard.writeText(text); showToast("Checklist copied to clipboard"); }
    catch(e){ const range=document.createRange();range.selectNodeContents($("commandText"));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);showToast("Select the highlighted text and copy it"); }
  });
  $("watchBtn").addEventListener("click",()=>showToast("Demo player: this fictional preview has no video stream."));
  $("infoBtn").addEventListener("click",()=>showToast("StreamFlix is a fictional learning-demo brand."));
  document.querySelectorAll(".poster").forEach(p=>p.addEventListener("click",()=>showToast(`${p.dataset.name} — fictional demo title`)));
  document.querySelectorAll(".stream-nav a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();showToast(`${a.textContent} section · preview demo`)}));
  render(0,false); startTimer();
})();