import { Notice, Plugin } from "obsidian";
import { VIEW_TYPE } from "./constants";
import { getViewOptions } from "./options";
import { RollupBasesView } from "./RollupBasesView";

export default class BaseRollupPlugin extends Plugin {
	onload() {
		const registered = this.registerBasesView(VIEW_TYPE, {
			name: "Rollup Table",
			icon: "table",
			factory: (controller, containerEl) => new RollupBasesView(controller, containerEl),
			options: getViewOptions,
		});

		console.log("[base-rollup] loaded", { registered });

		if (!registered) {
			new Notice("Base Rollup: Bases are not enabled.");
		}
	}

	onunload() {
		console.log("[base-rollup] unloaded");
	}
}
