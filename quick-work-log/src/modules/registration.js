export function createRegistrationGate() {
  let active = false;
  return {
    begin() { if (active) return false; active = true; return true; },
    finish() { active = false; },
    isActive() { return active; }
  };
}

export function isSafeToRetry(result) {
  return result?.kind === "failure" && result.confirmedNotCreated === true;
}
