{
  description = "AyurAlign backend development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        start-db = pkgs.writeShellScriptBin "start-db" ''
          set -e
          export PGDATA="$PWD/.pgdata"
          pid=$(lsof -ti :5432 2>/dev/null || true)
          if [ -n "$pid" ]; then
            echo "Stopping stale postgres (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 1
          fi
          if [ ! -d "$PGDATA" ]; then
            echo "Initializing PostgreSQL..."
            initdb -D "$PGDATA" --encoding=UTF8 --no-locale
            echo "unix_socket_directories = '/tmp'" >> "$PGDATA/postgresql.conf"
          fi
          pg_ctl -D "$PGDATA" -l "$PGDATA/pg.log" start
          psql -h localhost -d template1 -tAc "SELECT 1 FROM pg_roles WHERE rolname='root'" | grep -q 1 || \
            psql -h localhost -d template1 -c "CREATE ROLE root WITH LOGIN SUPERUSER PASSWORD 'root';"
          psql -h localhost -d template1 -tAc "SELECT 1 FROM pg_database WHERE datname='smart_health'" | grep -q 1 || \
            psql -h localhost -d template1 -c "CREATE DATABASE smart_health;"
          echo "PostgreSQL ready on localhost:5432"
        '';

        stop-db = pkgs.writeShellScriptBin "stop-db" ''
          export PGDATA="$PWD/.pgdata"
          if [ -d "$PGDATA" ]; then
            pg_ctl -D "$PGDATA" stop
          else
            echo "No .pgdata found"
          fi
        '';

        status-db = pkgs.writeShellScriptBin "status-db" ''
          pg_isready -h localhost -q && echo "PostgreSQL is running" || echo "PostgreSQL is stopped"
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            postgresql
            start-db
            stop-db
            status-db
          ];

          shellHook = ''
            echo "Node.js $(node --version) | pnpm $(pnpm --version) | PostgreSQL $(psql --version)"
          '';
        };
      });
}
