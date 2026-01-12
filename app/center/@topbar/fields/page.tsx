"use client";

import { Button } from "@/components/ui/button";
import { useFieldDialog } from "../../fields/_hooks/use-field-dialog";

export default function FieldsHeaderActions() {
  const { openCreate } = useFieldDialog();

  return (
    <Button size="sm" onClick={openCreate}>
      New field
    </Button>
  );
}
