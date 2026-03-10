import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
    id: number;
    email: string;
    fullName: string;
    avatarInitials: string | null;
    createdAt: string | null;
}

async function fetchMe(): Promise<AuthUser | null> {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return res.json();
}

export function useAuth() {
    return useQuery<AuthUser | null>({
        queryKey: ["auth", "me"],
        queryFn: fetchMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (creds: { email: string; password: string }) => {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(creds),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Login failed");
            }
            return res.json() as Promise<{ user: AuthUser }>;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
    });
}

export function useRegister() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: { email: string; password: string; fullName: string }) => {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Registration failed");
            }
            return res.json() as Promise<AuthUser>;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
    });
}

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        },
        onSuccess: () => {
            qc.setQueryData(["auth", "me"], null);
            qc.clear();
        },
    });
}
