// src/lib/authState.js
import { ref } from 'vue';
import { supabase } from './supabaseClient';

export const user = ref(null);
export const authReady = ref(false);

export const initAuth = async () => {
    if (authReady.value) return; // Already ran? Skip.
    await new Promise((resolve) => setTimeout(resolve, 500)); // REMINDER remove this later, this is to check if loading is correctly hide authready

    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;
    authReady.value = true;

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null;
    });
};

export async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return error;
}

export async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile#update-password`,
    });

    if (error) {
        throw error;
    }
}

export async function updateUser(userData) {
    const { data, error } = await supabase.auth.updateUser({
        data: userData,
    });
    if (error) {
        throw error;
    }
    return data;
}

export async function updateUserEmail(email) {
    const { data, error } = await supabase.auth.updateUser({
        email: email,
    });
    if (error) {
        throw error;
    }
    return data;
}

export async function updateUserPassword(password) {
    const { data, error } = await supabase.auth.updateUser({
        password: password,
    });
    if (error) {
        throw error;
    }
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw error;
    }
    return data;
}

export async function signUp(email, password, metaData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metaData,
        },
    });
    if (error) {
        throw error;
    }
    return data;
}

export async function signInWithOAuth(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) {
        throw error;
    }
    return data;
}
