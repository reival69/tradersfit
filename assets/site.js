document.getElementById("year").textContent = new Date().getFullYear();

// Every «Quiero empezar» button opens the registration link set in <meta name="registro">
const registro = document.querySelector('meta[name="registro"]')?.content.trim();
if (registro) {
  for (const link of document.querySelectorAll(".js-registro")) {
    link.href = registro;
    link.target = "_blank";
    link.rel = "noopener";
  }
}
