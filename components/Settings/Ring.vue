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
            Settings - Ring
          </h3>
          <div class="space-y-3 text-white/70">
            <p>Configure the ring display settings.</p>

            <div class="mt-4 space-y-4">
              <!-- Ring Color Settings -->
              <div class="grid grid-cols-[5rem_10rem_5rem_auto] items-center gap-4">
                <p>Ring color</p>
                <div class="flex">
                  <AppToggle v-model="config.ring.colorEnabled" />
                </div>
                <input
                  v-if="config.ring.colorEnabled"
                  v-model="config.ring.color"
                  type="color"
                  class="size-full overflow-hidden rounded border-none border-transparent p-0 outline-none"
                >
              </div>

              <!-- Ring Size Settings -->
              <div class="grid grid-cols-[5rem_5rem_auto] items-center gap-4">
                <p>Ring size</p>
                <input
                  v-model="config.ring.size"
                  type="number"
                  min="1"
                  max="9"
                  class="w-full rounded-md border border-white/10 bg-transparent px-2 py-1 outline-none"
                >
              </div>
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
            Ring
            <span class="icon-[material-symbols--settings-alert-outline-rounded] ml-2 size-5" />
          </h3>

          <p class="w-2/3 text-white/70">
            Displays a ring with dart board numbers around the board view, enhancing visibility of the board segments during gameplay.
          </p>
        </div>
        <div class="flex">
          <div @click="$emit('toggle', 'ring')" class="absolute inset-y-0 left-12 right-0 cursor-pointer" />
          <AppToggle
            @update:model-value="toggleFeature"
            v-model="config.ring.enabled"
          />
        </div>
      </div>
      <div class="gradient-mask-left absolute inset-y-0 right-0 w-2/3">
        <img :src="imageUrl" alt="Ring" class="size-full object-cover opacity-70">
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import AppToggle from "../AppToggle.vue";
import { AutodartsToolsConfig, type IConfig } from "@/utils/storage";

const emit = defineEmits([ "toggle", "settingChange" ]);
useStorage("adt:active-settings", "ring");
const config = ref<IConfig>();
const imageUrl = browser.runtime.getURL("/images/ring.png");

onMounted(async () => {
  config.value = await AutodartsToolsConfig.getValue();
});

watch(config, async (_, oldValue) => {
  if (!oldValue) return;

  await AutodartsToolsConfig.setValue(toRaw(config.value!));
  emit("settingChange");
  console.log("Ring setting changed");
}, { deep: true });

async function toggleFeature() {
  if (!config.value) return;

  // Toggle the feature
  const wasEnabled = config.value.ring.enabled;
  config.value.ring.enabled = !wasEnabled;

  // If we're enabling the feature, open settings
  if (!wasEnabled) {
    await nextTick();
    emit("toggle", "ring");
  }
}
</script>
