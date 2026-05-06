#!/usr/bin/env bash
# Resolves JDK 21 for Gradle/Capacitor. Homebrew OpenJDK often is NOT registered with
# /usr/libexec/java_home, which causes "invalid source release: 21" while Gradle still runs on JDK 17.
set -euo pipefail

resolve_java21_home() {
  local hb p cand

  if command -v brew >/dev/null 2>&1; then
    p="$(brew --prefix openjdk@21 2>/dev/null || true)"
    if [[ -n "${p}" && -x "${p}/libexec/openjdk.jdk/Contents/Home/bin/java" ]]; then
      echo "${p}/libexec/openjdk.jdk/Contents/Home"
      return 0
    fi
  fi

  if [[ "$(uname -m)" == "arm64" ]]; then
    for cand in \
      "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
      "/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home" \
      "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"; do
      if [[ -x "${cand}/bin/java" ]]; then
        echo "${cand}"
        return 0
      fi
    done
  else
    for cand in \
      "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
      "/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home" \
      "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"; do
      if [[ -x "${cand}/bin/java" ]]; then
        echo "${cand}"
        return 0
      fi
    done
  fi

  if [[ -x "/usr/libexec/java_home" ]]; then
    hb="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
    if [[ -n "${hb}" && -x "${hb}/bin/java" ]]; then
      echo "${hb}"
      return 0
    fi
  fi

  return 1
}

JAVA_HOME="$(resolve_java21_home)" || {
  echo "myvoice-fe: JDK 21 not found. Install with:" >&2
  echo "  brew install openjdk@21" >&2
  exit 1
}

export JAVA_HOME
export PATH="${JAVA_HOME}/bin:${PATH}"

if ! "${JAVA_HOME}/bin/java" -version 2>&1 | grep -q 'version \"21'; then
  echo "myvoice-fe: JAVA_HOME does not appear to be JDK 21: ${JAVA_HOME}" >&2
  "${JAVA_HOME}/bin/java" -version >&2 || true
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GRADLEW="${PROJECT_ROOT}/android/gradlew"

if [[ -x "${GRADLEW}" ]]; then
  (cd "$(dirname "${GRADLEW}")" && ./gradlew --stop) >/dev/null 2>&1 || true
fi

exec "$@"
