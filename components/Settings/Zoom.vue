<template>
  <template v-if="!$attrs['data-feature-index']">
    <!-- Settings Panel -->
    <div
      v-if="config"
      class="adt-container min-h-56"
    >
      <div class="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h3 class="mb-1 font-bold uppercase">
            Settings - Darts Zoom
          </h3>
          <div class="space-y-3 text-white/70">
            <p>Configure the zoom feature for dart throws.</p>

            <div class="mt-4">
              <h4 class="mb-2 font-semibold">
                Position
              </h4>
              <div class="flex">
                <AppRadioGroup
                  v-model="config.zoom.position"
                  class="grid max-w-sm grid-cols-3"
                  :options="[
                    { label: 'Bottom Right', value: 'bottom-right' },
                    { label: 'Bottom Left', value: 'bottom-left' },
                    { label: 'Center', value: 'center' },
                  ]"
                />
              </div>
            </div>

            <div class="mt-4">
              <h4 class="mb-2 font-semibold">
                View Mode
              </h4>
              <div class="flex">
                <AppRadioGroup
                  v-model="config.zoom.mode"
                  class="grid max-w-sm grid-cols-2"
                  :options="[
                    { label: 'Live Board', value: 'live' },
                    { label: 'Image Board', value: 'image' },
                  ]"
                />
              </div>
            </div>

            <div class="mt-4">
              <h4 class="mb-2 font-semibold">
                Zoom On
              </h4>
              <div class="flex">
                <AppRadioGroup
                  v-model="config.zoom.zoomOn"
                  class="grid max-w-sm grid-cols-2"
                  :options="[
                    { label: 'Everyone', value: 'everyone' },
                    { label: 'Opponents', value: 'opponents' },
                  ]"
                />
              </div>
              <p class="mt-1 text-sm text-white/60">
                Control which throws to display in the zoom view.
              </p>
            </div>

            <div class="mt-4">
              <h4 class="mb-2 font-semibold">
                Center Dot Marker
              </h4>
              <div class="flex items-center">
                <AppToggle
                  v-model="config.zoom.showMarker"
                />
                <span class="ml-2">Show center dot marker</span>
              </div>
              <p class="mt-1 text-sm text-white/60">
                Toggle visibility of the center dot marker that indicates dart position.
              </p>
            </div>

            <div class="mt-6">
              <h4 class="mb-2 font-semibold">
                Zoom Level
              </h4>
              <div class="max-w-sm">
                <AppSlider
                  v-model="zoomLevel"
                  :min="1"
                  :max="6"
                  :step="0.1"
                  :show-labels="true"
                  :format-label="formatZoomLabel"
                />
              </div>
              <p class="mt-1 text-sm text-white/60">
                Adjust the zoom level of the dart throw images.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <!-- Feature Card -->
    <div
      v-if="config"
      class="adt-container h-56 transition-transform hover:-translate-y-0.5"
    >
      <div class="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h3 class="mb-1 flex items-center font-bold uppercase">
            Darts Zoom
            <span class="icon-[material-symbols--settings-alert-outline-rounded] ml-2 size-5" />
          </h3>
          <p class="w-2/3 text-white/70">
            Shows a zoomed view of your dart throws in the bottom corner of the screen or in the center of the screen.
          </p>
        </div>
        <div class="flex">
          <div @click="$emit('toggle', 'zoom')" class="absolute inset-y-0 left-12 right-0 cursor-pointer" />
          <AppToggle
            @update:model-value="toggleFeature"
            v-model="config.zoom.enabled"
          />
        </div>
      </div>
      <div class="gradient-mask-left absolute inset-y-0 right-0 w-2/3">
        <img :src="imageUrl" alt="Darts Zoom" class="size-full object-cover opacity-70">
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import AppRadioGroup from "../AppRadioGroup.vue";
import AppSlider from "../AppSlider.vue";
import AppToggle from "../AppToggle.vue";

import { AutodartsToolsConfig, type IConfig } from "@/utils/storage";

const emit = defineEmits([ "toggle", "settingChange" ]);
const config = ref<IConfig>();
const imageUrl = browser.runtime.getURL("/images/zoom.png");

// Computed property for zoom level with mapping between 1-6 and the actual zoom value
const zoomLevel = computed({
  get: () => {
    if (!config.value?.zoom?.level) return 1;
    // Map from actual zoom level to slider (1-6)
    return config.value.zoom.level;
  },
  set: (value: number) => {
    if (config.value?.zoom) {
      config.value.zoom.level = value;
    }
  },
});

// Format the zoom level as a percentage (1 = 0%, 6 = 100%)
function formatZoomLabel(value: number): string {
  const percentage = Math.round(((value - 1) / 5) * 100);
  return `${percentage}%`;
}

onMounted(async () => {
  config.value = await AutodartsToolsConfig.getValue();
});

watch(config, async (_, oldValue) => {
  if (!oldValue) return;

  await AutodartsToolsConfig.setValue(toRaw(config.value!));
  emit("settingChange");
  console.log("Zoom setting changed");
}, { deep: true });

async function toggleFeature() {
  if (!config.value) return;

  // Toggle the feature
  const wasEnabled = config.value.zoom.enabled;
  config.value.zoom.enabled = !wasEnabled;

  // If we're enabling the feature, open settings
  if (!wasEnabled) {
    await nextTick();
    emit("toggle", "zoom");
  }
}
</script>
