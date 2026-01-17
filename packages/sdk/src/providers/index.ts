import { PrivacyProvider } from "../types";
import { privacyCash } from "./privacy-cash";
import { shadowwire } from "./shadowwire";
import { noir } from "./noir";

/**
 * All privacy providers in Veil.
 */
const providers: Record<string, PrivacyProvider> = {
  [privacyCash.name]: privacyCash,
  [shadowwire.name]: shadowwire,
  [noir.name]: noir,
};

/**
 * Resolve a provider by its string key.
 * If none is passed, return the first provider.
 */
export function resolvePrivateProvider(name?: string): PrivacyProvider {
  if (name && providers[name]) {
    return providers[name];
  }

  // default fallback (first registered provider)
  const keys = Object.keys(providers);
  if (keys.length === 0) {
    throw new Error("No privacy providers registered.");
  }

  return providers[keys[0]];
}

/**
 * Export registered providers for introspection if needed.
 */
export const registeredProviders = providers;
