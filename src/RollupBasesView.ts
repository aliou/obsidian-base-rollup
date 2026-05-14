import {
  type BasesPropertyId,
  BasesView,
  type QueryController,
  setIcon,
  TFile,
  type Value,
} from "obsidian";
import { COLUMN_WIDTHS_KEY, MIN_COLUMN_WIDTH, VIEW_TYPE } from "./constants";
import {
  computeTargetValue,
  getDataProperty,
  getTargetProperty,
  toPropertyId,
} from "./property";

export class RollupBasesView extends BasesView {
  type = VIEW_TYPE;
  private containerEl: HTMLElement;
  private isUpdatingTargetProperty = false;

  constructor(controller: QueryController, containerEl: HTMLElement) {
    super(controller);
    this.containerEl = containerEl;
  }

  onload() {
    this.render();
    this.handleUpdate("load");
  }

  onDataUpdated(): void {
    this.render();
    this.handleUpdate("data-updated");
  }

  private render(): void {
    const groups = this.data?.groupedData ?? [];
    const rows = this.data?.data ?? [];
    const columns = this.getColumns();
    const widths = this.getColumnWidths(
      columns,
      rows.map((row) => row.file),
    );
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const rowHeight = this.getRowHeight();
    const hasGroups =
      groups.length > 0 && groups.some((group) => group.hasKey());
    const tableHeight =
      (rows.length + (hasGroups ? groups.length : 0)) * rowHeight;

    this.containerEl.empty();
    this.containerEl.addClass("bases-view");
    this.containerEl.setAttr("data-view-type", "table");
    this.containerEl.setAttr(
      "data-view-name",
      this.config?.name ?? "Rollup Table",
    );

    const headerEl = this.containerEl.createDiv({ cls: "bases-thead" });
    headerEl.style.width = `${tableWidth}px`;
    const headerRowEl = headerEl.createDiv({
      cls: "bases-tr",
      attr: { "data-ignore-swipe": "true" },
    });

    let left = 0;
    for (const [index, column] of columns.entries()) {
      const width = widths[index] ?? MIN_COLUMN_WIDTH;
      this.renderHeaderCell(headerRowEl, column, index, left, width);
      left += width;
    }

    const tableContainerEl = this.containerEl.createDiv({
      cls: "bases-table-container node-insert-event",
      attr: { tabindex: "0" },
    });
    tableContainerEl.style.width = `${tableWidth}px`;
    tableContainerEl.style.height = `${tableHeight}px`;

    const tableEl = tableContainerEl.createDiv({ cls: "bases-table" });
    tableEl.style.top = "0px";
    tableEl.style.width = `${tableWidth}px`;

    const renderGroups = hasGroups
      ? groups
      : [{ key: undefined, entries: rows }];
    for (const group of renderGroups) {
      if (hasGroups) {
        this.renderGroupHeading(tableEl, group.key, columns);
      }

      const bodyEl = tableEl.createDiv({ cls: "bases-tbody" });
      bodyEl.style.height = `${group.entries.length * rowHeight}px`;
      bodyEl.style.setProperty("--bases-table-row-height", `${rowHeight}px`);

      for (const [rowIndex, row] of group.entries.entries()) {
        const rowEl = bodyEl.createDiv({ cls: "bases-tr" });
        rowEl.style.top = `${rowIndex * rowHeight}px`;
        rowEl.style.width = `${tableWidth}px`;

        let cellLeft = 0;
        for (const [columnIndex, column] of columns.entries()) {
          const width = widths[columnIndex] ?? MIN_COLUMN_WIDTH;
          this.renderBodyCell(
            rowEl,
            row.file,
            column,
            row.getValue(column),
            cellLeft,
            width,
          );
          cellLeft += width;
        }
      }
    }
  }

  private renderGroupHeading(
    parentEl: HTMLElement,
    key: Value | undefined,
    columns: BasesPropertyId[],
  ): void {
    const groupEl = parentEl.createDiv({ cls: "bases-group-heading" });
    groupEl.createDiv({
      cls: "bases-group-property",
      text: this.getGroupPropertyName(columns),
    });
    const valueEl = groupEl.createDiv({ cls: "bases-group-value" });
    key?.renderTo(valueEl, this.app.renderContext);
  }

  private renderHeaderCell(
    parentEl: HTMLElement,
    column: BasesPropertyId,
    index: number,
    left: number,
    width: number,
  ): void {
    const cellEl = parentEl.createDiv({
      cls: `bases-td${index === 0 ? " mod-implicit" : ""}`,
      attr: { draggable: "true" },
    });
    cellEl.style.insetInlineStart = `${left}px`;
    cellEl.style.width = `${width}px`;

    const tableHeaderEl = cellEl.createDiv({ cls: "bases-table-header" });
    const labelEl = tableHeaderEl.createDiv({
      cls: "bases-table-header-label",
    });
    const iconEl = labelEl.createDiv({ cls: "bases-table-header-icon" });

    setIcon(iconEl, this.getColumnIcon(column));
    labelEl.createDiv({
      cls: "bases-table-header-name",
      text: this.getColumnName(column),
    });
    cellEl.createDiv({ cls: "bases-table-header-sort" });

    const resizerEl = cellEl.createDiv({
      cls: "bases-table-header-resizer",
      attr: { draggable: "true" },
    });
    this.registerDomEvent(resizerEl, "mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.startResize(event, column, width);
    });
  }

  private renderBodyCell(
    parentEl: HTMLElement,
    file: TFile,
    column: BasesPropertyId,
    value: Value | null,
    left: number,
    width: number,
  ): void {
    const property = getDataProperty(column);
    const cellEl = parentEl.createDiv({
      cls: "bases-td",
      attr: { "data-property": property },
    });
    cellEl.style.insetInlineStart = `${left}px`;
    cellEl.style.width = `${width}px`;

    if (property === "file.name") {
      const renderedEl = cellEl.createDiv({
        cls: "bases-table-cell bases-rendered-value markdown-rendered",
      });
      const linkEl = renderedEl.createSpan({
        cls: "internal-link",
        text: file.basename,
        attr: {
          "data-href": file.path,
          draggable: "true",
        },
      });
      this.registerDomEvent(linkEl, "click", (event) => {
        event.preventDefault();
        void this.app.workspace.openLinkText(
          file.path,
          "",
          event.metaKey || event.ctrlKey,
        );
      });
      return;
    }

    const metadataEl = cellEl.createDiv({
      cls: "bases-table-cell bases-metadata-value metadata-property-value",
      attr: { "data-property-type": this.getPropertyType(column) },
    });

    if (value) {
      value.renderTo(metadataEl, this.app.renderContext);
      return;
    }

    metadataEl.createDiv({
      cls: "metadata-input-longtext",
      attr: { placeholder: "Empty" },
    });
  }

  private startResize(
    event: MouseEvent,
    column: BasesPropertyId,
    startWidth: number,
  ): void {
    const startX = event.clientX;
    const widths = this.getPersistedColumnWidths();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(
        MIN_COLUMN_WIDTH,
        Math.round(startWidth + moveEvent.clientX - startX),
      );
      widths[getDataProperty(column)] = nextWidth;
      this.config?.set?.(COLUMN_WIDTHS_KEY, widths);
      this.render();
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  private handleUpdate(reason: string): void {
    this.logUpdate(reason);
    void this.updateTargetProperty(reason);
  }

  private async updateTargetProperty(reason: string): Promise<void> {
    if (this.isUpdatingTargetProperty) {
      return;
    }

    const targetFile = this.getEmbeddedFile();
    if (!targetFile) {
      console.log("[base-rollup] no embedded file found", { reason });
      return;
    }

    const targetProperty = getTargetProperty(this.config);
    const nextValue = computeTargetValue(this.config, this.data?.data ?? []);
    if (nextValue == null) {
      console.log("[base-rollup] no value computed", { reason });
      return;
    }

    const currentValue =
      this.app.metadataCache.getFileCache(targetFile)?.frontmatter?.[
        targetProperty
      ];
    if (currentValue === nextValue) {
      return;
    }

    this.isUpdatingTargetProperty = true;

    try {
      await this.app.fileManager.processFrontMatter(
        targetFile,
        (frontmatter) => {
          frontmatter[targetProperty] = nextValue;
        },
      );

      console.log("[base-rollup] updated target property", {
        reason,
        file: targetFile.path,
        property: targetProperty,
        value: nextValue,
      });
    } catch (error) {
      console.error("[base-rollup] failed to update target property", {
        reason,
        file: targetFile.path,
        property: targetProperty,
        error,
      });
    } finally {
      this.isUpdatingTargetProperty = false;
    }
  }

  private getColumns(): BasesPropertyId[] {
    const ordered = this.config?.getOrder?.() ?? [];
    return ordered.length > 0 ? ordered : (this.data?.properties ?? []);
  }

  private getColumnName(column: BasesPropertyId): string {
    return (
      this.config?.getDisplayName?.(column) ??
      getDataProperty(column)
        .replace(/^note\./, "")
        .replace(/^file\./, "")
    );
  }

  private getColumnWidths(
    columns: BasesPropertyId[],
    files: TFile[],
  ): number[] {
    const persisted = this.getPersistedColumnWidths();
    const measured = this.measureColumnWidths(columns, files);
    return columns.map(
      (column, index) =>
        persisted[getDataProperty(column)] ??
        measured[index] ??
        MIN_COLUMN_WIDTH,
    );
  }

  private getPersistedColumnWidths(): Record<string, number> {
    const value = this.config?.get?.(COLUMN_WIDTHS_KEY);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, number>)
      : {};
  }

  private measureColumnWidths(
    columns: BasesPropertyId[],
    files: TFile[],
  ): number[] {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = getComputedStyle(this.containerEl).font;
    }

    return columns.map((column) => {
      const property = getDataProperty(column);
      const values =
        property === "file.name"
          ? files.map((file) => file.basename)
          : files.map((file) =>
              this.stringifyValue(
                this.app.metadataCache.getFileCache(file)?.frontmatter?.[
                  property.replace(/^note\./, "")
                ],
              ),
            );
      const longest = [this.getColumnName(column), ...values].reduce(
        (max, value) => (value.length > max.length ? value : max),
        "",
      );
      return Math.max(
        MIN_COLUMN_WIDTH,
        Math.ceil(
          (context?.measureText(longest).width ?? longest.length * 8) + 56,
        ),
      );
    });
  }

  private getRowHeight(): number {
    const configured = getComputedStyle(this.containerEl).getPropertyValue(
      "--bases-table-row-height",
    );
    return Number.parseInt(configured, 10) || 30;
  }

  private getGroupPropertyName(columns: BasesPropertyId[]): string {
    const groupBy = this.config?.get?.("groupBy") as
      | { property?: string }
      | undefined;
    if (groupBy?.property) {
      return this.getColumnName(toPropertyId(groupBy.property));
    }
    return columns.find((column) => getDataProperty(column) === "note.Type")
      ? "Type"
      : "";
  }

  private getColumnIcon(column: BasesPropertyId): string {
    if (getDataProperty(column) === "file.name") {
      return "info";
    }
    if (this.getPropertyType(column) === "date") {
      return "calendar";
    }
    return "text";
  }

  private getPropertyType(column: BasesPropertyId): string {
    return getDataProperty(column).toLowerCase().endsWith(".date")
      ? "date"
      : "text";
  }

  private stringifyValue(value: unknown): string {
    return value == null ? "" : String(value);
  }

  private getEmbeddedFile(): TFile | null {
    const pathEl = this.containerEl.closest<HTMLElement>("[data-path]");
    const embeddedPath = pathEl?.dataset.path;

    if (embeddedPath) {
      const file = this.app.vault.getAbstractFileByPath(embeddedPath);
      if (file instanceof TFile) {
        return file;
      }
    }

    return this.app.workspace.getActiveFile();
  }

  private logUpdate(reason: string): void {
    console.log("[base-rollup] base view update", {
      reason,
      viewName: this.config?.name,
      rowCount: this.data?.data?.length ?? 0,
      targetFile: this.getEmbeddedFile()?.path ?? null,
    });
  }
}
