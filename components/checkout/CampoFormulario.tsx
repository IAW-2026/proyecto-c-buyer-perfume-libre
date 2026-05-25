"use client";

import React from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type Props<T extends FieldValues> = {
  nombre: FieldPath<T>;
  control: Control<T>;
  texto: React.ReactNode;
  ejemplo?: string;
  inputProps?: React.ComponentProps<typeof Input>;
};

export default function CampoFormulario<T extends FieldValues = FieldValues>({
  nombre,
  control,
  texto,
  ejemplo,
  inputProps,
}: Props<T>) {
  return (
    <Controller
      name={nombre}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{texto}</FieldLabel>
          <Input
            {...field}
            aria-invalid={fieldState.invalid}
            placeholder={ejemplo}
            {...inputProps}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
