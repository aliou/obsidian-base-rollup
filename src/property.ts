import type { BasesEntry, BasesPropertyId, BasesViewConfig } from "obsidian";
import {
  AGGREGATION_KEY,
  DEFAULT_TARGET_PROPERTY,
  SOURCE_PROPERTY_KEY,
  TARGET_PROPERTY_KEY,
} from "./constants";
import type { Aggregation } from "./types";

export function getTargetProperty(config: BasesViewConfig | undefined): string {
  const value = config?.get?.(TARGET_PROPERTY_KEY);
  return typeof value === "string" && value.trim()
    ? value.trim()
    : DEFAULT_TARGET_PROPERTY;
}

export function getAggregation(
  config: BasesViewConfig | undefined,
): Aggregation {
  const value = config?.get?.(AGGREGATION_KEY);
  return value === "sum" ||
    value === "avg" ||
    value === "max" ||
    value === "min"
    ? value
    : "rowCount";
}

export function computeTargetValue(
  config: BasesViewConfig | undefined,
  rows: BasesEntry[],
): number | null {
  const aggregation = getAggregation(config);
  if (aggregation === "rowCount") {
    return rows.length;
  }

  const sourceProperty = config?.getAsPropertyId?.(SOURCE_PROPERTY_KEY);
  if (!sourceProperty) {
    return null;
  }

  const values = rows
    .map((row) => Number(row.getValue(sourceProperty)?.toString()))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  if (aggregation === "sum") {
    return values.reduce((sum, value) => sum + value, 0);
  }
  if (aggregation === "avg") {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  if (aggregation === "max") {
    return Math.max(...values);
  }
  return Math.min(...values);
}

export function toPropertyId(property: string): BasesPropertyId {
  return property.includes(".")
    ? (property as BasesPropertyId)
    : (`note.${property}` as BasesPropertyId);
}

export function getDataProperty(column: BasesPropertyId): string {
  return toPropertyId(String(column));
}
