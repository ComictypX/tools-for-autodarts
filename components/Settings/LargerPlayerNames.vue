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
            Settings - Larger Player Names
          </h3>
          <div class="space-y-3 text-white/70">
            <p>Configure the size of player names display on the match page.</p>

            <div class="mt-4 space-y-4">
              <div class="grid grid-cols-[auto_1fr] items-center gap-4">
                <p>Font Size:</p>
                <AppInput
                  v-model="sizeValue"
                  type="text"
                  placeholder="Enter a size value (e.g., 1.5)"
                  class="w-full"
                />
              </div>
              <p class="text-sm text-white/50">
                This value will be used as a multiplier for the default font size.
                For example, a value of 1.5 will make the player names 50% larger than the default size.
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
            Larger Player Names
            <span class="icon-[material-symbols--settings-alert-outline-rounded] ml-2 size-5" />
          </h3>
          <p class="w-2/3 text-white/70">
            Increases the font-size of player names on the match page for better visibility.
          </p>
        </div>
        <div class="flex">
          <div @click="$emit('toggle', 'larger-player-names')" class="absolute inset-y-0 left-12 right-0 cursor-pointer" />
          <AppToggle
            @update:model-value="toggleFeature"
            v-model="config.largerPlayerNames.enabled"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import AppToggle from "../AppToggle.vue";
import AppInput from "../AppInput.vue";
import { AutodartsToolsConfig, type IConfig } from "@/utils/storage";

const emit = defineEmits([ "toggle", "settingChange" ]);
const config = ref<IConfig>();
const sizeValue = ref("");

onMounted(async () => {
  config.value = await AutodartsToolsConfig.getValue();
  // Initialize the size value from config
  if (config.value?.largerPlayerNames?.value) {
    sizeValue.value = config.value.largerPlayerNames.value.toString();
  }
});

// Update config when size value changes
watch(sizeValue, (newValue) => {
  if (config.value) {
    // Convert string to number
    const numValue = Number.parseFloat(newValue) || 1; // Default to 1 if parsing fails
    config.value.largerPlayerNames.value = numValue;
  }
});

watch(config, async (_, oldValue) => {
  if (!oldValue) return;

  await AutodartsToolsConfig.setValue(toRaw(config.value!));
  emit("settingChange");
  console.log("Larger Player Names setting changed");
}, { deep: true });

async function toggleFeature() {
  if (!config.value) return;

  // Toggle the feature
  const wasEnabled = config.value.largerPlayerNames.enabled;
  config.value.largerPlayerNames.enabled = !wasEnabled;

  // If we're enabling the feature, open settings
  if (!wasEnabled) {
    await nextTick();
    emit("toggle", "larger-player-names");
  }
}
</script>
