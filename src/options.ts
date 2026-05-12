import { BasesAllOptions, BasesViewConfig } from "obsidian";
import { AGGREGATION_KEY, DEFAULT_TARGET_PROPERTY, SOURCE_PROPERTY_KEY, TARGET_PROPERTY_KEY } from "./constants";

export function getViewOptions(config: BasesViewConfig): BasesAllOptions[] {
	return [
		{
			type: "text",
			displayName: "Target property",
			key: TARGET_PROPERTY_KEY,
			default: DEFAULT_TARGET_PROPERTY,
			placeholder: DEFAULT_TARGET_PROPERTY,
		},
		{
			type: "dropdown",
			displayName: "Value",
			key: AGGREGATION_KEY,
			default: "rowCount",
			options: {
				rowCount: "Number of rows",
				sum: "Sum",
				avg: "Average",
				max: "Maximum",
				min: "Minimum",
			},
		},
		{
			type: "property",
			displayName: "Source property",
			key: SOURCE_PROPERTY_KEY,
			shouldHide: () => {
				const aggregation = config.get(AGGREGATION_KEY);
				return aggregation == null || aggregation === "rowCount";
			},
		},
	];
}
