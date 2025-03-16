import { addStyles, waitForElement } from "@/utils";

export async function smallerScores() {
  try {
    console.log("Autodarts Tools: Set score smaller");

    addStyles(`
        .adp_points-small { font-size: 3em!important; }
        `, "score-smaller");

    await waitForElement(".ad-ext-player-active");

    const activePlayerCardPointsEl = document.querySelector(".ad-ext-player-active .ad-ext-player-score") || document.querySelector(".ad-ext-player-winner .ad-ext-player-score");
    const inactivePlayerCardPointsElArr = [ ...document.querySelectorAll(".ad-ext-player-inactive .ad-ext-player-score") ];

    // if Bull-off
    const bustedPlayerElArr = document.querySelectorAll(".ad-ext-player-busted .ad-ext-player-score");
    if (bustedPlayerElArr.length) {
      inactivePlayerCardPointsElArr.push(...bustedPlayerElArr);
    }

    if (inactivePlayerCardPointsElArr.length && activePlayerCardPointsEl) {
      activePlayerCardPointsEl.classList.remove("adp_points-small");
      [ ...inactivePlayerCardPointsElArr ].forEach(el => el.classList.add("adp_points-small"));
    }
  } catch (e) {
    console.error("Autodarts Tools: Set score smaller - Error: ", e);
  }
}
