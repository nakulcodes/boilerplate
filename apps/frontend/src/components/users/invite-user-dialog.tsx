'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  inviteUserSchema,
  InviteUserFormData,
  createUserSchema,
  CreateUserFormData,
} from '@/schemas/user.schema';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Role } from '@/types/role.type';

type Mode = 'invite' | 'create';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteUserDialogProps) {
  const [mode, setMode] = useState<Mode>('invite');
  const [roles, setRoles] = useState<Role[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const inviteForm = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '', firstName: '', lastName: '', roleId: '' },
  });

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      roleId: '',
      password: '',
    },
  });

  const loadRoles = useCallback(async () => {
    try {
      const data = await fetchApi<Role[]>(API_ROUTES.ROLES.LIST);
      setRoles(data);
    } catch {
      // roles dropdown will be empty
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadRoles();
      setGeneratedPassword(null);
    }
  }, [open, loadRoles]);

  const onInviteSubmit = async (formData: InviteUserFormData) => {
    try {
      await fetchApi(API_ROUTES.USERS.INVITE, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          roleId: formData.roleId || undefined,
        }),
      });
      toast.success('Invitation sent');
      inviteForm.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite user');
    }
  };

  const onCreateSubmit = async (formData: CreateUserFormData) => {
    try {
      const result = await fetchApi<{
        userId: string;
        generatedPassword: string | null;
      }>(API_ROUTES.USERS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          roleId: formData.roleId || undefined,
          password: formData.password || undefined,
        }),
      });

      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        toast.success('User created. Copy the generated password.');
      } else {
        toast.success('User created');
        createForm.reset();
        onOpenChange(false);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      inviteForm.reset();
      createForm.reset();
      setMode('invite');
      setGeneratedPassword(null);
    }
    onOpenChange(isOpen);
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Password copied to clipboard');
    }
  };

  const handleDone = () => {
    createForm.reset();
    setGeneratedPassword(null);
    onOpenChange(false);
    onSuccess();
  };

  if (generatedPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Created</DialogTitle>
            <DialogDescription>
              Save the generated password. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPassword}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDone}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Invite a user or create them directly
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite">Send Invite</TabsTrigger>
            <TabsTrigger value="create">Create Directly</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'invite' ? (
          <form
            onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                disabled={inviteForm.formState.isSubmitting}
                {...inviteForm.register('email')}
              />
              {inviteForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {inviteForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-firstName">First Name</Label>
                <Input
                  id="invite-firstName"
                  placeholder="John"
                  disabled={inviteForm.formState.isSubmitting}
                  {...inviteForm.register('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-lastName">Last Name</Label>
                <Input
                  id="invite-lastName"
                  placeholder="Doe"
                  disabled={inviteForm.formState.isSubmitting}
                  {...inviteForm.register('lastName')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="roleId"
                control={inviteForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={inviteForm.formState.isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={inviteForm.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteForm.formState.isSubmitting}
              >
                {inviteForm.formState.isSubmitting
                  ? 'Sending...'
                  : 'Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="name@example.com"
                disabled={createForm.formState.isSubmitting}
                {...createForm.register('email')}
              />
              {createForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-firstName">First Name</Label>
                <Input
                  id="create-firstName"
                  placeholder="John"
                  disabled={createForm.formState.isSubmitting}
                  {...createForm.register('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastName">Last Name</Label>
                <Input
                  id="create-lastName"
                  placeholder="Doe"
                  disabled={createForm.formState.isSubmitting}
                  {...createForm.register('lastName')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="roleId"
                control={createForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={createForm.formState.isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">
                Password{' '}
                <span className="text-muted-foreground font-normal">
                  (leave blank to generate)
                </span>
              </Label>
              <Input
                id="create-password"
                type="password"
                placeholder="••••••••"
                disabled={createForm.formState.isSubmitting}
                {...createForm.register('password')}
              />
              {createForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={createForm.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createForm.formState.isSubmitting}
              >
                {createForm.formState.isSubmitting
                  ? 'Creating...'
                  : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
