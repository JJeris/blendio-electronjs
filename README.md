# Blendio ElectronJS (ENG)

This is an ElectronJS app called "Blendio" that was developed for a [bachelor thesis](https://github.com/JJeris/bakalaura_darba_praktiska_dala). It contains basic functionality for managing Blender 3D versions and their project files, allowing the user to specify launch arguments before opening files, as well as choosing to delete .blend files or Blender versions themselves.

It was inspired by [Blenderbase](https://github.com/PhysicalAddons/blenderbase-public) and [Blender Launcher](https://github.com/Victor-IX/Blender-Launcher-V2) projects.

## Prerequisites

The project was developed for the Windows platform. Prerequisites to set up the project are:

- Download and install [Node.js](https://nodejs.org/en),
- Download and install [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm),
- Set up an IDE like [Visual Studio Code](https://code.visualstudio.com/).

## Commands

The main commands for installing the dependencies, running in development mode and building the app are listed below.

```ps
cd blendio-electronjs        
npm install                 // Install Node.js dependencies.
npm run dev                 // Run development mode.
npm run build:win           // Build the project with an installer file.
npm run build:unpack        // Build the project with just the executable.
```

# Blendio ElectronJS (LV)

Šī ir ElectronJS lietojumprogramma "Blendio", kas tika izstrādāta [bakalaura darba](https://github.com/JJeris/bakalaura_darba_praktiska_dala) ietvarā. Tā satur pamatfunkcionalitāti Blender 3D versiju un to projektu failu pārvaldībai, atļaujot lietotājam norādīt komandrindas parametrus pirms failu atvēršanas, kā arī ļauj izvēlēties izdzēst .blend failus vai pašas Blender versijas.

Tās ideju iedvesmoja [Blenderbase](https://github.com/PhysicalAddons/blenderbase-public) un [Blender Launcher](https://github.com/Victor-IX/Blender-Launcher-V2) projekti.

## Priekšnosacījumi

Projekts tika izstrādāts un ir paredzēts darbībai Windows platformā. Priekšnosacījumi, lai uzstādītu projektu, ir:

- Lejupielādēt un instalēt [Node.js](https://nodejs.org/en),
- Lejupielādēt un instalēt [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Uzstādīt IDE, piemēram, [Visual Studio Code](https://code.visualstudio.com/).

## Komandrindas pavēles

Zemāk ir redzamas galvenās komandrindas pavēles atkarību instalācijai, projekta iedarbināšanu izstrādes režīmā un projekta sakomplektēšanas.

```ps
cd blendio-electronjs        
npm install                 // Instalē Node.js atkarības
npm run dev                 // Iedarbina izstrādes režīmā.
npm run build:win           // Sakomplektē projektu ar instalētāja failu.
npm run build:unpack        // Sakomplektē projektu tikai ar izpildāmo failu.
```
