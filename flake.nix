{
  description = "Ambiente di sviluppo MERN (Microservizi)";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs;[
          nodejs_latest
          pnpm
          # Client da riga di comando per test rapidi (opzionale)
          mongosh 
        ];

        shellHook = ''
          export MONGO_URI="mongodb://localhost:27017/textgen_db"
        '';
      };
    };
}
