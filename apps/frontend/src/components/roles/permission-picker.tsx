"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PERMISSION_GROUPS, PERMISSIONS_ENUM } from "@/constants/permissions.constants";

interface PermissionPickerProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionPicker({
  selected,
  onChange,
  disabled,
}: PermissionPickerProps) {
  const togglePermission = (permission: string) => {
    onChange(
      selected.includes(permission)
        ? selected.filter((p) => p !== permission)
        : [...selected, permission]
    );
  };

  const toggleGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) => selected.includes(p));
    if (allSelected) {
      onChange(selected.filter((p) => !groupPermissions.includes(p)));
    } else {
      onChange([...new Set([...selected, ...groupPermissions])]);
    }
  };

  const groups = Object.entries(PERMISSION_GROUPS) as [
    string,
    { label: string; permissions: PERMISSIONS_ENUM[] },
  ][];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map(([key, group]) => {
        const allSelected = group.permissions.every((p) =>
          selected.includes(p)
        );
        const someSelected = group.permissions.some((p) =>
          selected.includes(p)
        );
        const selectedCount = group.permissions.filter((p) =>
          selected.includes(p)
        ).length;

        return (
          <Card key={key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${key}`}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement).dataset.state =
                          someSelected && !allSelected
                            ? "indeterminate"
                            : allSelected
                              ? "checked"
                              : "unchecked";
                      }
                    }}
                    onCheckedChange={() => toggleGroup(group.permissions)}
                    disabled={disabled}
                  />
                  <CardTitle className="text-sm">
                    <Label
                      htmlFor={`group-${key}`}
                      className="cursor-pointer font-medium"
                    >
                      {group.label}
                    </Label>
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {selectedCount}/{group.permissions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {group.permissions.map((permission) => {
                  const label = permission
                    .split(":")
                    .slice(1)
                    .join(" ")
                    .replace(/-/g, " ");

                  return (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`perm-${permission}`}
                        checked={selected.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`perm-${permission}`}
                        className="text-sm text-muted-foreground cursor-pointer font-normal capitalize"
                      >
                        {label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
