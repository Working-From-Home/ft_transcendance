#!/bin/sh

set -x

BOLD="\e[1m"
RESET="\e[0m"
LIGHT_RED="\e[91m"
LIGHT_GREEN="\e[92m"
LIGHT_CYAN="\e[96m"

logging(){
	local type=$1; shift
	printf "${LIGHT_CYAN}${BOLD}Entrypoint${RESET} [%b] : %b\n" "$type" "$*"
}
log_info(){
	logging "${LIGHT_GREEN}info${RESET}" "$@"
}
log_error(){
	logging "${LIGHT_RED}error${RESET}" "$@" >&2
	exit 1
}

log_info "Entrypoint script started..."
if [ "$(id -u)" = "0" ]; then
	log_info "Switch from root:root to node:node, aka $(id -u node):$(id -g node) "
	chown -R node:node /app
 	exec su-exec node "$0" "$@"
fi

exec "$@"