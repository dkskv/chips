import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "vitest.config.ts",
      },
    },
  },
  async viteFinal(config, { configType }) {
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      base: configType === "PRODUCTION" ? "/chips/" : "/",
    });
  },
};

export default config;
