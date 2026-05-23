{
  description = "AyurAlign backend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs.nodejs_22;

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
              nodejs
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

          packages.default = pkgs.stdenv.mkDerivation (finalAttrs: {
            pname = "ayuralign-backend";
            version = "0.1.0";
            src = ./.;

            nativeBuildInputs = with pkgs; [
              nodejs
              pnpm
              pnpmConfigHook
            ];

            pnpmDeps = pkgs.fetchPnpmDeps {
              inherit (finalAttrs) pname version src;
              pnpm = pkgs.pnpm;
              fetcherVersion = 3;
              hash = "sha256-JAoA0cRngGj9uRwcxaZu9DDsK++bansQj7R0sR4uzDg=";
            };

            buildPhase = ''
              runHook preBuild
              pnpm run build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -r dist node_modules package.json nest-cli.json tsconfig.json $out/
              runHook postInstall
            '';
          });
        }
      ) // {
      nixosModules.default = { config, lib, pkgs, ... }:
        with lib;
        let
          cfg = config.services.ayuralign;
          app = self.packages.${pkgs.system}.default;
          nodejs = pkgs.nodejs_22;
        in
        {
          options.services.ayuralign = {
            enable = mkEnableOption "AyurAlign backend";
            environmentFile = mkOption {
              type = types.path;
              description = "File with environment variables (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)";
            };
            openFirewall = mkOption {
              type = types.bool;
              default = false;
              description = "Open port 3000 in the firewall";
            };
            port = mkOption {
              type = types.port;
              default = 3000;
              description = "Port the backend listens on";
            };
          };


          config = mkIf cfg.enable {
            networking.firewall.allowedTCPPorts = mkIf cfg.openFirewall [ cfg.port ];
            services.postgresql = {
              enable = true;
              package = pkgs.postgresql_17;
              ensureDatabases = [ "smart_health" ];
              ensureUsers = [{
                name = "smart_health";
                ensureDBOwnership = true;
              }];
              authentication = pkgs.lib.mkOverride 10 ''
                # TYPE  DATABASE        USER            ADDRESS                 METHOD
                local   all             all                                     trust
                host    all             all             127.0.0.1/32            trust
                host    all             all             ::1/128                 trust
              '';
            };

            systemd.services.ayuralign = {
              description = "AyurAlign Backend";
              wantedBy = [ "multi-user.target" ];
              after = [ "network.target" "postgresql.service" ];
              requires = [ "postgresql.service" ];

              serviceConfig = {
                Type = "simple";
                User = "ayuralign";
                WorkingDirectory = app;
                ExecStart = "${nodejs}/bin/node ${app}/dist/main.js";
                Restart = "on-failure";
                Environment = [ "PORT=${builtins.toString cfg.port}" ];
                EnvironmentFile = cfg.environmentFile;
              };

              preStart = ''
                ${nodejs}/bin/node ${app}/node_modules/typeorm/cli.js migration:run \
                  -d ${app}/dist/database/data-source.js
              '';
            };

            users.users.ayuralign = {
              isSystemUser = true;
              group = "ayuralign";
            };
            users.groups.ayuralign = { };
          };
        };
    };
}
