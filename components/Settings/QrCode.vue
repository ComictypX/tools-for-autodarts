<template>
  <!-- Feature Card -->
  <div
    v-if="config"
    class="adt-container h-56 transition-transform hover:-translate-y-0.5"
  >
    <div class="relative z-10 flex h-full flex-col justify-between">
      <div>
        <h3 class="mb-1 flex items-center font-bold uppercase">
          QR Code
        </h3>
        <p class="w-2/3 text-white/70">
          Automatically displays the lobby QR code for easily sharing with other players.
        </p>
      </div>
      <div class="flex">
        <AppToggle
          @update:model-value="toggleFeature"
          v-model="config.qrCode.enabled"
        />
      </div>
    </div>
    <div class="gradient-mask-left absolute inset-y-0 right-0 w-2/3">
      <img :src="imageUrl" alt="QR Code" class="size-full object-cover">
    </div>
  </div>
</template>

<script setup lang="ts">
import AppToggle from "../AppToggle.vue";

import { AutodartsToolsConfig, type IConfig } from "@/utils/storage";

const emit = defineEmits([ "settingChange" ]);

const imageUrl = browser.runtime.getURL("/images/qr-code.png");

const config = ref<IConfig>();

onMounted(async () => {
  config.value = await AutodartsToolsConfig.getValue();
});

watch(config, async (_, oldValue) => {
  if (!oldValue) return;

  await AutodartsToolsConfig.setValue(toRaw(config.value!));
  emit("settingChange");
  console.log("QR Code setting changed");
}, { deep: true });

async function toggleFeature() {
  if (!config.value) return;

  // Toggle the feature
  const wasEnabled = config.value.qrCode.enabled;
  config.value.qrCode.enabled = !wasEnabled;
}
</script>
