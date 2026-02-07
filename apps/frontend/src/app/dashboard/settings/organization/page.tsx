'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  organizationSchema,
  OrganizationFormData,
} from '@/schemas/organization.schema';
import { fetchApi } from '@/utils/api-client';
import { uploadImage } from '@/utils/download';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/lib/toast';
import { Camera, X } from 'lucide-react';
import type { Organization } from '@/types/user.type';

function OrganizationSettingsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: '', domain: '', logoUrl: null },
  });

  const currentLogoUrl = watch('logoUrl');

  const loadOrganization = useCallback(async () => {
    try {
      const data = await fetchApi<Organization>(API_ROUTES.ORGANIZATION.GET);
      setOrganization(data);
      reset({
        name: data.name,
        domain: data.domain,
        logoUrl: data.logoUrl || null,
      });
      setPreviewUrl(data.logoUrl || null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load organization';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setValue('logoUrl', url, { shouldDirty: true });
      setPreviewUrl(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload logo';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setValue('logoUrl', null, { shouldDirty: true });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (formData: OrganizationFormData) => {
    try {
      const updated = await fetchApi<Organization>(
        API_ROUTES.ORGANIZATION.UPDATE,
        {
          method: 'PUT',
          body: JSON.stringify(formData),
        },
      );
      setOrganization(updated);
      reset(formData);
      toast.success('Organization settings updated');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update organization';
      toast.error(message);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization profile and branding
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <Label>Organization Logo</Label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt={organization?.name} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {organization?.name ? getInitials(organization.name) : '?'}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleLogoChange}
                className="hidden"
                disabled={isUploading || isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            placeholder="Acme Inc."
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-domain">Domain</Label>
          <Input
            id="org-domain"
            placeholder="acme.com"
            disabled={isSubmitting}
            {...register('domain')}
          />
          {errors.domain && (
            <p className="text-sm text-red-500">{errors.domain.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used for email verification and SSO
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-slug">Slug</Label>
          <Input
            id="org-slug"
            value={organization?.slug || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for your organization (cannot be changed)
          </p>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || !isDirty}
            onClick={() => {
              reset();
              setPreviewUrl(organization?.logoUrl || null);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.ORGANIZATION_UPDATE}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to edit organization settings
        </div>
      }
    >
      <OrganizationSettingsContent />
    </PermissionGuard>
  );
}
