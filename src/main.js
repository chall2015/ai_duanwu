function initApp() {
  const root = document.getElementById("root");
  if (!root) return;

  // Render the core framed device wrap shell
  root.innerHTML = `
    <div id="app-container" class="w-full h-full max-w-[400px] max-h-[820px] bg-stone-950 border-0 sm:border border-stone-800/80 sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between relative">
    </div>
  `;

  // Start with local persistence initial loads
  loadSavedStickers();

  // Run the first dynamic render loop
  renderUI();

  // Fine-tuned state-change listeners to support hot-updating the front lobby counters 
  subscribeState((state) => {
    if (state.currentPage === "home") {
      const sweetVal = document.getElementById("val-sweet");
      const saltyVal = document.getElementById("val-salty");
      const barSweet = document.getElementById("bar-sweet");
      const barSalty = document.getElementById("bar-salty");

      if (sweetVal && saltyVal && barSweet && barSalty) {
        const total = state.votes.sweet + state.votes.salty || 1;
        const sweetPercent = Math.round((state.votes.sweet / total) * 100);
        const saltyPercent = 100 - sweetPercent;

        sweetVal.textContent = state.votes.sweet.toLocaleString();
        saltyVal.textContent = state.votes.salty.toLocaleString();

        barSweet.style.width = `${sweetPercent}%`;
        barSweet.textContent = `${sweetPercent}%`;

        barSalty.style.width = `${saltyPercent}%`;
        barSalty.textContent = `${saltyPercent}%`;
      }
    }
  });

  // Load votes and start background polling
  fetchVotes();
  setInterval(fetchVotes, 5000);
}

// Bootstrap after doc is fully processed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
