<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="open"
      ref="correctionRef"
      class="correction-bg rounded-[var(--chakra-radii-md)] p-3 text-[var(--chakra-colors-white)] shadow-lg"
      :style="{
        position: 'absolute',
        left: `${correctionContainerX}px`,
        top: `calc(${correctionContainerY}px + 1rem)`,
        width: `calc(${correctionContainerWidth}px + 7rem)`,
        transform: 'translateX(-3.5rem)',
      }"
    >
      <div class="grid grid-cols-3 gap-2 text-center">
        <template v-for="(row, rowIndex) in currentGrid" :key="rowIndex">
          <div
            @click="applyCorrection(cell)"
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="relative overflow-hidden rounded-[var(--chakra-radii-md)]"
          >
            <AppButton
              size="md"
              auto
              class="w-full p-0 font-bold"
            >
              {{ cell }}
            </AppButton>
            <div
              class="pointer-events-none absolute inset-0"
              :style="{ backgroundColor: `${getCellColor(cell, rowIndex, cellIndex)}33` }"
            />
          </div>
        </template>
        <div
          @click="applyCorrection('MISS')"
          class="relative overflow-hidden rounded-[var(--chakra-radii-md)]"
        >
          <AppButton
            size="md"
            auto
            class="w-full p-0 font-bold"
          >
            MISS
          </AppButton>
          <div
            class="pointer-events-none absolute inset-0"
            style="background-color: rgba(32, 33, 32, 0.2)"
          />
        </div>
        <div
          @click="applyCorrection('25')"
          class="relative overflow-hidden rounded-[var(--chakra-radii-md)]"
        >
          <AppButton
            size="md"
            auto
            class="w-full p-0 font-bold"
          >
            25
          </AppButton>
          <div
            class="pointer-events-none absolute inset-0"
            style="background-color: rgba(255, 252, 230, 0.2)"
          />
        </div>
        <div
          @click="applyCorrection('BULL')"
          class="relative overflow-hidden rounded-[var(--chakra-radii-md)]"
        >
          <AppButton
            size="md"
            auto
            class="w-full p-0 font-bold"
          >
            BULL
          </AppButton>
          <div
            class="pointer-events-none absolute inset-0"
            style="background-color: rgba(238, 83, 81, 0.2)"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { waitForElement } from "@/utils";
import AppButton from "@/components/AppButton.vue";
import { AutodartsToolsGameData } from "@/utils/game-data-storage";
import { getAuthToken } from "@/utils/helpers";

interface Correction {
  x: number;
  y: number;
}

const CORRECTIONS: Record<string, Correction> = {
  S1: { x: 0.23864869472714267, y: 0.7450953567163014 },
  S2: { x: 0.45156927001320907, y: -0.5932624277493371 },
  S3: { x: 0.006614487481989349, y: -0.8056185967301086 },
  S4: { x: 0.6363481572289519, y: 0.4769283984847778 },
  S5: { x: -0.24335398593069038, y: 0.7162318288953786 },
  S6: { x: 0.7887362326309516, y: -0.004146439478043747 },
  S7: { x: -0.4574008834816887, y: -0.6323923445494517 },
  S8: { x: -0.7412494631215135, y: -0.23441905139777536 },
  S9: { x: -0.6534612426143511, y: 0.48251813111811254 },
  S10: { x: 0.7482240114833393, y: -0.24319787404082716 },
  S11: { x: -0.7997749434596216, y: 0.002609159964620326 },
  S12: { x: -0.44862206143097255, y: 0.6376106644786924 },
  S13: { x: 0.7657816555847717, y: 0.2630475650418204 },
  S14: { x: -0.7588071072229459, y: 0.24548991975571716 },
  S15: { x: 0.6340993248240286, y: -0.4626684401171191 },
  S16: { x: -0.6446824205636349, y: -0.47144726276017057 },
  S17: { x: 0.23612605852489288, y: -0.7640746841952271 },
  S18: { x: 0.4555966097927985, y: 0.6463894871217442 },
  S19: { x: -0.22915151016306695, y: -0.7465170389091238 },
  S20: { x: -0.009680958895161329, y: 0.7839243751962206 },
  D1: { x: 0.29821686695850486, y: 0.921979532538415 },
  D2: { x: 0.5877363642403922, y: -0.7781926904772413 },
  D3: { x: 0.006683720409154148, y: -0.9669106431745664 },
  D4: { x: 0.7814205788508053, y: 0.5626980260563854 },
  D5: { x: -0.29874138724572774, y: 0.9153026218855984 },
  D6: { x: 0.9602060077219553, y: -0.005938962992133956 },
  D7: { x: -0.5743689234220842, y: -0.793091476216504 },
  D8: { x: -0.9195241263816659, y: -0.30888093969047203 },
  D9: { x: -0.7804687928152158, y: 0.567664287969473 },
  D10: { x: 0.9254421743303428, y: -0.28901589203812184 },
  D11: { x: -0.9617373526429098, y: -0.010905224905221356 },
  D12: { x: -0.5669195305524531, y: 0.7836966811887797 },
  D13: { x: 0.9179927814607116, y: 0.2845873589234851 },
  D14: { x: -0.9269735192512972, y: 0.2994861446627476 },
  D15: { x: 0.7814205788508053, y: -0.5646434282144784 },
  D16: { x: -0.7879181856848471, y: -0.5646434282144784 },
  D17: { x: 0.2972100423247734, y: -0.9172480240436915 },
  D18: { x: 0.5529725308487797, y: 0.7961123359714984 },
  D19: { x: -0.31115704202844646, y: -0.90979863117406 },
  D20: { x: 0.006683720409154148, y: 0.9773808957991924 },
  T1: { x: 0.1854691492803045, y: 0.5626980260563854 },
  T2: { x: 0.36673770910799847, y: -0.4752507137789034 },
  T3: { x: 0.012218921762980582, y: -0.590141739888456 },
  T4: { x: 0.4780778274565276, y: 0.3544569629003027 },
  T5: { x: -0.1917285254300467, y: 0.5691384862613842 },
  T6: { x: 0.5918590348379009, y: 0.002379264588128967 },
  T7: { x: -0.3527396679508579, y: -0.482800978207915 },
  T8: { x: -0.5803020827136042, y: -0.195127736904066 },
  T9: { x: -0.49013584290195006, y: 0.3544569629003027 },
  T10: { x: 0.5725376977354034, y: -0.20156818260489834 },
  T11: { x: -0.5974766045824907, y: 0.002379264588128967 },
  T12: { x: -0.34629922225002546, y: 0.48541269215056226 },
  T13: { x: 0.5618036215673494, y: 0.18700537467865902 },
  T14: { x: -0.5803020827136042, y: 0.18700537467865902 },
  T15: { x: 0.4952523493254142, y: -0.3389643575559905 },
  T16: { x: -0.479401766733896, y: -0.35184524895765573 },
  T17: { x: 0.17323006428379178, y: -0.5665267723187372 },
  T18: { x: 0.33424120680460284, y: 0.48541269215056226 },
  T19: { x: -0.18528807972921424, y: -0.5600863266179045 },
  T20: { x: -0.007102415339516647, y: 0.605634345232768 },
  25: { x: -0.0006619696386841871, y: 0.060343275895620954 },
  BULL: { x: 0.005778476062148273, y: -0.004061181112703493 },
};

const FIELDS = [
  [ "S20", "S1", "S18", "D20", "D1", "D18", "T20", "T1", "T18" ],
  [ "S17", "S2", "S15", "D17", "D2", "D15", "T17", "T2", "T15" ],
  [ "S19", "S3", "S17", "D19", "D3", "D17", "T19", "T3", "T17" ],
  [ "S18", "S4", "S13", "D18", "D4", "D13", "T18", "T4", "T13" ],
  [ "S12", "S5", "S20", "D12", "D5", "D20", "T12", "T5", "T20" ],
  [ "S13", "S6", "S10", "D13", "D6", "D10", "T13", "T6", "T10" ],
  [ "S16", "S7", "S19", "D16", "D7", "D19", "T16", "T7", "T19" ],
  [ "S11", "S8", "S16", "D11", "D8", "D16", "T11", "T8", "T16" ],
  [ "S14", "S9", "S12", "D14", "D9", "D12", "T14", "T9", "T12" ],
  [ "S15", "S10", "S6", "D15", "D10", "D6", "T15", "T10", "T6" ],
  [ "S8", "S11", "S14", "D8", "D11", "D14", "T8", "T11", "T14" ],
  [ "S9", "S12", "S5", "D9", "D12", "D5", "T9", "T12", "T5" ],
  [ "S4", "S13", "S6", "D4", "D13", "D6", "T4", "T13", "T6" ],
  [ "S11", "S14", "S9", "D11", "D14", "D9", "T11", "T14", "T9" ],
  [ "S2", "S15", "S10", "D2", "D15", "D10", "T2", "T15", "T10" ],
  [ "S8", "S16", "S7", "D8", "D16", "D7", "T8", "T16", "T7" ],
  [ "S3", "S17", "S2", "D3", "D17", "D3", "T3", "T17", "T2" ],
  [ "S1", "S18", "S4", "D1", "D18", "D4", "T1", "T18", "T4" ],
  [ "S7", "S19", "S3", "D7", "D19", "D3", "T7", "T19", "T3" ],
  [ "S5", "S20", "S1", "D5", "D20", "D1", "T5", "T20", "T1" ],
];

// TODO: Sort them by FIELDS | Dark: "#202120"
const COLORS = [
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
  [ "#FFFCE6", "#FFFCE6", "#FFFCE6", "#66BA6B", "#66BA6B", "#66BA6B", "#EE5351", "#EE5351", "#EE5351" ],
];

const throw1 = ref<HTMLElement | null>(null);
const throw2 = ref<HTMLElement | null>(null);
const throw3 = ref<HTMLElement | null>(null);
const correctionRef = ref<HTMLElement | null>(null);

const open = ref<boolean>(false);
const correctionContainerWidth = ref<number>(0);
const correctionContainerX = ref<number>(0);
const correctionContainerY = ref<number>(0);
const currentGrid = ref<string[][]>([]);
const currentGridIndex = ref<number>(-1);

watch(open, (newVal) => {
  if (newVal) {
    window.addEventListener("keydown", handleKeyDown);
  } else {
    window.removeEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

function handleKeyDown(event: KeyboardEvent) {
  if (!open.value) return;

  // Check if it's a numpad key
  const isNumpadKey = event.key.startsWith("Numpad") || event.code.startsWith("Numpad");

  if (event.key === "+" || event.key === "NumpadAdd" || event.key === "Escape") {
    deactivateThrow(true);
    open.value = false;
    if (event.key === "NumpadAdd" || isNumpadKey) {
      event.preventDefault();
    }
    return;
  }

  switch (event.key) {
    case "7":
    case "Numpad7":
      if (currentGrid.value[0] && currentGrid.value[0][0]) {
        applyCorrection(currentGrid.value[0][0]);
      }
      if (event.key === "Numpad7" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "8":
    case "Numpad8":
      if (currentGrid.value[0] && currentGrid.value[0][1]) {
        applyCorrection(currentGrid.value[0][1]);
      }
      if (event.key === "Numpad8" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "9":
    case "Numpad9":
      if (currentGrid.value[0] && currentGrid.value[0][2]) {
        applyCorrection(currentGrid.value[0][2]);
      }
      if (event.key === "Numpad9" || isNumpadKey) {
        event.preventDefault();
      }
      break;

    case "4":
    case "Numpad4":
      if (currentGrid.value[1] && currentGrid.value[1][0]) {
        applyCorrection(currentGrid.value[1][0]);
      }
      if (event.key === "Numpad4" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "5":
    case "Numpad5":
      if (currentGrid.value[1] && currentGrid.value[1][1]) {
        applyCorrection(currentGrid.value[1][1]);
      }
      if (event.key === "Numpad5" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "6":
    case "Numpad6":
      if (currentGrid.value[1] && currentGrid.value[1][2]) {
        applyCorrection(currentGrid.value[1][2]);
      }
      if (event.key === "Numpad6" || isNumpadKey) {
        event.preventDefault();
      }
      break;

    case "1":
    case "Numpad1":
      if (currentGrid.value[2] && currentGrid.value[2][0]) {
        applyCorrection(currentGrid.value[2][0]);
      }
      if (event.key === "Numpad1" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "2":
    case "Numpad2":
      if (currentGrid.value[2] && currentGrid.value[2][1]) {
        applyCorrection(currentGrid.value[2][1]);
      }
      if (event.key === "Numpad2" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "3":
    case "Numpad3":
      if (currentGrid.value[2] && currentGrid.value[2][2]) {
        applyCorrection(currentGrid.value[2][2]);
      }
      if (event.key === "Numpad3" || isNumpadKey) {
        event.preventDefault();
      }
      break;

    case "0":
    case "Numpad0":
      applyCorrection("MISS");
      if (event.key === "Numpad0" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case ".":
    case ",":
    case "NumpadDecimal":
      applyCorrection("25");
      if (event.key === "NumpadDecimal" || isNumpadKey) {
        event.preventDefault();
      }
      break;
    case "Enter":
    case "NumpadEnter":
      applyCorrection("BULL");
      if (event.key === "NumpadEnter" || isNumpadKey) {
        event.preventDefault();
      }
      break;
  }
}

function getCellColor(cell: string, rowIndex: number, cellIndex: number): string {
  if (currentGridIndex.value >= 0 && currentGridIndex.value < COLORS.length) {
    const colorRow = rowIndex % 3;
    const colorCol = cellIndex % 3;
    const colorIndex = colorRow * 3 + colorCol;
    return COLORS[currentGridIndex.value][colorIndex];
  }

  if (cell === "MISS") return "#202120";
  if (cell === "25") return "#FFFCE6";
  if (cell === "BULL") return "#EE5351";

  if (cell.startsWith("S")) return "#FFFCE6";
  if (cell.startsWith("D")) return "#66BA6B";
  if (cell.startsWith("T")) return "#EE5351";

  return "#202120";
}

onClickOutside(correctionRef, () => {
  deactivateThrow(false);
  open.value = false;
});

onMounted(async () => {
  console.log("Autodarts Tools: Quick Correction");

  const throwsContainer = await waitForElement("#ad-ext-turn");
  throw1.value = throwsContainer.querySelector("div:nth-of-type(2)");
  throw2.value = throwsContainer.querySelector("div:nth-of-type(3)");
  throw3.value = throwsContainer.querySelector("div:nth-of-type(4)");

  [ throw1.value, throw2.value, throw3.value ].forEach((throwEl) => {
    if (throwEl) {
      throwEl.addEventListener("click", () => openCorrection(throwEl));
    }
  });

  window.addEventListener("keydown", (event) => {
    if (open.value) return;

    switch (event.key) {
      case "/":
      case "NumpadDivide":
        if (throw1.value) throw1.value.click();
        event.preventDefault();
        break;
      case "*":
      case "NumpadMultiply":
        if (throw2.value) throw2.value.click();
        event.preventDefault();
        break;
      case "-":
      case "NumpadSubtract":
        if (throw3.value) throw3.value.click();
        event.preventDefault();
        break;
    }
  });
});

async function openCorrection(throwElement?: HTMLElement) {
  if (!throwElement?.classList.contains("ad-ext-turn-throw")) return;

  if (throwElement) {
    const rect = throwElement.getBoundingClientRect();
    correctionContainerWidth.value = rect.width;

    const marginSize = 16;
    const fullWidth = correctionContainerWidth.value + 7 * 16 + marginSize;

    let initialX = rect.left;

    const windowWidth = window.innerWidth;

    const leftBoundary = (3.5 * 16) - marginSize;
    if (initialX < leftBoundary) {
      initialX = leftBoundary;
    }

    const rightEdge = initialX + fullWidth - (3.5 * 16);
    if (rightEdge > windowWidth) {
      initialX = windowWidth - fullWidth + (3.5 * 16);
    }

    correctionContainerX.value = initialX;
    const height = throwElement.clientHeight;
    correctionContainerY.value = rect.top + height;

    const config = await AutodartsToolsConfig.getValue();

    const throwText = config.enhancedScoringDisplay.enabled
      ? (throwElement.querySelector("p > div > div:last-of-type") as HTMLElement)?.innerText.trim()
      : (throwElement as HTMLElement).innerText.trim();

    findGridForThrow(throwText);
  }

  open.value = true;
}

function findGridForThrow(throwText: string) {
  currentGrid.value = [];
  currentGridIndex.value = -1;

  if (throwText.startsWith("S")) {
    for (let i = 0; i < FIELDS.length; i++) {
      if (FIELDS[i][1] === throwText) {
        currentGrid.value = [
          FIELDS[i].slice(0, 3),
          FIELDS[i].slice(3, 6),
          FIELDS[i].slice(6, 9),
        ];
        currentGridIndex.value = i;
        break;
      }
    }
  } else if (throwText.startsWith("D")) {
    for (let i = 0; i < FIELDS.length; i++) {
      if (FIELDS[i][4] === throwText) {
        currentGrid.value = [
          FIELDS[i].slice(0, 3),
          FIELDS[i].slice(3, 6),
          FIELDS[i].slice(6, 9),
        ];
        currentGridIndex.value = i;
        break;
      }
    }
  } else if (throwText.startsWith("T")) {
    for (let i = 0; i < FIELDS.length; i++) {
      if (FIELDS[i][7] === throwText) {
        currentGrid.value = [
          FIELDS[i].slice(0, 3),
          FIELDS[i].slice(3, 6),
          FIELDS[i].slice(6, 9),
        ];
        currentGridIndex.value = i;
        break;
      }
    }
  }
}

async function deactivateThrow(submit: boolean = true) {
  if (!submit) return;

  const gameData = await AutodartsToolsGameData.getValue();
  const matchId = gameData.match?.id;

  if (!matchId) {
    console.error("No match ID found");
    return;
  }

  try {
    await browser.runtime.sendMessage({
      type: "fetch",
      url: `https://api.autodarts.io/gs/v0/matches/${matchId}/corrections`,
      options: {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": await getAuthToken(),
        },
        body: JSON.stringify({ activated: -1 }),
      },
    });
    console.log("Throw deactivated successfully");
  } catch (error) {
    console.error("Error deactivating throw:", error);
  }
}

async function applyCorrection(value: string) {
  const gameData = await AutodartsToolsGameData.getValue();
  const matchId = gameData.match?.id;
  const activated = gameData.match?.activated ?? -1;

  if (!matchId || activated === -1) {
    console.error("No match ID or match not activated");
    return;
  }

  console.log(`Applying correction: ${value}`);

  const coords = CORRECTIONS[value];
  if (!coords && value !== "MISS") {
    console.error(`No coordinates found for value: ${value}`);
    return;
  }

  let payload;

  if (value === "MISS") {
    payload = {
      changes: {
        [activated]: {
          type: "bouncer",
        },
      },
    };
  } else {
    payload = {
      changes: {
        [activated]: {
          point: {
            x: coords.x,
            y: coords.y,
          },
          type: "normal",
        },
      },
    };
  }

  const authToken = await getAuthToken();

  try {
    const response = await browser.runtime.sendMessage({
      type: "fetch",
      url: `https://api.autodarts.io/gs/v0/matches/${matchId}/throws`,
      options: {
        method: "PATCH",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authToken,
        },
        body: JSON.stringify(payload),
      },
    });

    if (response.ok) {
      console.log("Correction applied successfully");
    } else {
      console.error("Failed to apply correction:", response.statusText || response.error || response);

      console.log("Attempting fallback method...");

      setTimeout(async () => {
        const retryResponse = await browser.runtime.sendMessage({
          type: "fetch",
          url: `https://api.autodarts.io/gs/v0/matches/${matchId}/throws`,
          options: {
            method: "PATCH",
            credentials: "include",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              "Authorization": await getAuthToken(),
            },
            body: JSON.stringify(payload),
          },
        });

        if (retryResponse.ok) {
          console.log("Correction applied successfully on retry");
        } else {
          console.error("Failed to apply correction on retry:", retryResponse.statusText || retryResponse.error || retryResponse);
        }
      }, 2000);
    }
  } catch (error) {
    console.error("Error sending correction:", error);
  }

  open.value = false;
  deactivateThrow(true);
}
</script>

<style>
.correction-bg {
  background-color: rgba(25, 32, 71, 0.90);
  background-image:
    radial-gradient(50% 30% at 86% 0%, rgba(49, 51, 112, 0.89) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(50% 70% at 70% 22%, rgba(38, 89, 154, 0.9) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(50% 70% at 112% 44%, rgba(44, 67, 108, 0.85) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(90% 90% at -12% 89%, rgba(15, 47, 80, 0.88) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(50% 70% at -2% 53%, rgba(52, 32, 95, 0.89) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(50% 70% at 36% 22%, rgba(64, 52, 134, 0.83) 0%, rgba(64, 52, 134, 0) 90%),
    radial-gradient(50% 40% at 66% 59%, rgba(32, 111, 185, 0.87) 7%, rgba(32, 111, 185, 0) 90%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
