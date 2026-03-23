import { useId } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

export type SegmentedSettingOption<T extends string = string> = {
  disabled?: boolean;
  label: string;
  value: T;
};

type SegmentedSettingProps<T extends string = string> = {
  helperText?: string;
  label: string;
  onChange: (value: T) => void;
  options: readonly SegmentedSettingOption<T>[];
  selectedValue: T;
};

export function SegmentedSetting<T extends string = string>({
  helperText,
  label,
  onChange,
  options,
  selectedValue,
}: SegmentedSettingProps<T>) {
  const helperTextId = useId();

  return (
    <fieldset
      aria-describedby={helperText ? helperTextId : undefined}
      className="min-w-0 space-y-2.5"
    >
      <legend className={cx("px-1", atlasUi.text.label)}>{label}</legend>
      {helperText ? (
        <p id={helperTextId} className={cx("-mt-1 px-1", atlasUi.text.meta)}>
          {helperText}
        </p>
      ) : null}

      <div className={atlasUi.controls.segmentedTrack}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={cx(
                atlasUi.controls.segmentedOption,
                isSelected && atlasUi.controls.segmentedOptionSelected,
                option.disabled && atlasUi.controls.segmentedOptionDisabled,
              )}
            >
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
