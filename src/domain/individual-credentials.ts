export interface IndividualCredentials {
  participationId: string;
  writeToken: string;
}

export function createIndividualCredentials(cryptoProvider: Crypto = globalThis.crypto): IndividualCredentials {
  const bytes = cryptoProvider.getRandomValues(new Uint8Array(32));
  const binary = String.fromCharCode(...bytes);
  const writeToken = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return { participationId: cryptoProvider.randomUUID(), writeToken };
}
