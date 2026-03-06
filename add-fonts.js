const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Get all font families currently in the file
const existingFamilies = new Set((html.match(/"family":"[^"]+/g) || []).map(m => m.replace('"family":"', '')));

console.log('Existing families:', [...existingFamilies].sort().join(', '));

// Define ALL fonts from the fonts directory that are missing
const allFonts = [
  {"family":"Aux Mono","id":"aux-mono","variants":[{"file":"fonts/aux-mono/Aux Mono.otf","weight":400,"style":"normal"},{"file":"fonts/aux-mono/Aux Mono.ttf","weight":400,"style":"normal"}]},
  {"family":"FH Lecturis","id":"fh-lecturis","variants":[{"file":"fonts/fh-lecturis/fhlecturisroundedtest-light.otf","weight":300,"style":"normal"},{"file":"fonts/fh-lecturis/fhlecturisroundedtest-regular.otf","weight":400,"style":"normal"},{"file":"fonts/fh-lecturis/fhlecturisroundedtest-bold.otf","weight":700,"style":"normal"},{"file":"fonts/fh-lecturis/fhlecturistest-light.otf","weight":300,"style":"normal"},{"file":"fonts/fh-lecturis/fhlecturistest-regular.otf","weight":400,"style":"normal"},{"file":"fonts/fh-lecturis/fhlecturistest-bold.otf","weight":700,"style":"normal"}]},
  {"family":"ID Grotesk","id":"id-grotesk","variants":[{"file":"fonts/id-grotesk/IDGrotesk-Thin-BF652cb1b461e9c.ttf","weight":100,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Light-BF652cb1b459bdf.ttf","weight":300,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Regular-BF652cb1b4787d7.ttf","weight":400,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Book-BF652cb1b45dae8.ttf","weight":500,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Medium-BF652cb1b4765e1.ttf","weight":500,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Semibold-BF652cb1b467d9d.ttf","weight":600,"style":"normal"},{"file":"fonts/id-grotesk/IDGrotesk-Bold-BF652cb1b4740d2.ttf","weight":700,"style":"normal"}]},
  {"family":"II Vorkurs","id":"iivorkurs","variants":[{"file":"fonts/iivorkurs/II Vorkurs Light.ttf","weight":300,"style":"normal"},{"file":"fonts/iivorkurs/II Vorkurs Light Oblique.ttf","weight":300,"style":"italic"},{"file":"fonts/iivorkurs/II Vorkurs Medium.ttf","weight":500,"style":"normal"},{"file":"fonts/iivorkurs/II Vorkurs Medium Oblique.ttf","weight":500,"style":"italic"},{"file":"fonts/iivorkurs/II Vorkurs Bold.ttf","weight":700,"style":"normal"},{"file":"fonts/iivorkurs/II Vorkurs Bold Oblique.ttf","weight":700,"style":"italic"}]},
  {"family":"Kurdis","id":"kurdis","variants":[{"file":"fonts/kurdis/KurdisVariableFamilyTest-Regular-BF64bf41e12455a.otf","weight":400,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-Bold-BF64bf41dfbff9f.otf","weight":700,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-Black-BF64bf41dfa220b.otf","weight":900,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-ExtraBold-BF64bf41e03dd58.otf","weight":800,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-SemiBold-BF64bf41e14db3c.otf","weight":600,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-Condensed-BF64bf41dfe7ff5.otf","weight":400,"style":"normal"},{"file":"fonts/kurdis/KurdisVariableFamilyTest-CondensedBold-BF64bf41e1775d6.otf","weight":700,"style":"normal"}]},
  {"family":"Neogrotesk","id":"neogrotesk","variants":[{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-ultralight.otf","weight":200,"style":"normal"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-light.otf","weight":300,"style":"normal"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-regular.otf","weight":400,"style":"normal"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-bold.otf","weight":700,"style":"normal"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-black.otf","weight":900,"style":"normal"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-ultralightit.otf","weight":200,"style":"italic"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-lightit.otf","weight":300,"style":"italic"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-regularit.otf","weight":400,"style":"italic"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-boldit.otf","weight":700,"style":"italic"},{"file":"fonts/neogrotesk/Fontspring-DEMO-neogroteskess-blackit.otf","weight":900,"style":"italic"}]},
  {"family":"Neogrotesk Sans","id":"neogrotesk-sans","variants":[{"file":"fonts/neogrotesk-sans/Fontspring-DEMO-neogroteskess-black.otf","weight":900,"style":"normal"},{"file":"fonts/neogrotesk-sans/Fontspring-DEMO-neogroteskess-bold.otf","weight":700,"style":"normal"},{"file":"fonts/neogrotesk-sans/Fontspring-DEMO-neogroteskess-light.otf","weight":300,"style":"normal"},{"file":"fonts/neogrotesk-sans/Fontspring-DEMO-neogroteskess-regular.otf","weight":400,"style":"normal"},{"file":"fonts/neogrotesk-sans/Fontspring-DEMO-neogroteskess-ultralight.otf","weight":200,"style":"normal"}]},
  {"family":"Northura","id":"northura","variants":[{"file":"fonts/northura/northura-thin.otf","weight":100,"style":"normal"},{"file":"fonts/northura/northura-thin.ttf","weight":100,"style":"normal"},{"file":"fonts/northura/northura-light.otf","weight":300,"style":"normal"},{"file":"fonts/northura/northura-light.ttf","weight":300,"style":"normal"},{"file":"fonts/northura/northura-regular.otf","weight":400,"style":"normal"},{"file":"fonts/northura/northura-regular.ttf","weight":400,"style":"normal"},{"file":"fonts/northura/northura-medium.otf","weight":500,"style":"normal"},{"file":"fonts/northura/northura-medium.ttf","weight":500,"style":"normal"},{"file":"fonts/northura/northura-bold.otf","weight":700,"style":"normal"},{"file":"fonts/northura/northura-bold.ttf","weight":700,"style":"normal"},{"file":"fonts/northura/northura-black.otf","weight":900,"style":"normal"},{"file":"fonts/northura/northura-black.ttf","weight":900,"style":"normal"}]},
  {"family":"Proto Mono","id":"proto-mono","variants":[{"file":"fonts/protomono/Proto Mono Light.ttf","weight":300,"style":"normal"},{"file":"fonts/protomono/Proto Mono Regular.ttf","weight":400,"style":"normal"},{"file":"fonts/protomono/Proto Mono Medium.ttf","weight":500,"style":"normal"},{"file":"fonts/protomono/Proto Mono Semi Bold.ttf","weight":600,"style":"normal"},{"file":"fonts/protomono/Proto Mono Light Shadow.ttf","weight":300,"style":"normal","variant":"light-shadow"},{"file":"fonts/protomono/Proto Mono Regular Shadow.ttf","weight":400,"style":"normal","variant":"regular-shadow"},{"file":"fonts/protomono/Proto Mono Medium Shadow.ttf","weight":500,"style":"normal","variant":"medium-shadow"},{"file":"fonts/protomono/Proto Mono Semi Bold Shadow.ttf","weight":600,"style":"normal","variant":"semibold-shadow"}]},
  {"family":"Svatopluk","id":"svatopluk","variants":[{"file":"fonts/svatopluk/Svatopluk-Light-iF67d6f0d98142b.otf","weight":300,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-LightItalic-iF67d6f0d98e9d2.otf","weight":300,"style":"italic"},{"file":"fonts/svatopluk/Svatopluk-Regular-iF67d6f0d9954ce.otf","weight":400,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-RegularItalic-iF67d6f0d99be16.otf","weight":400,"style":"italic"},{"file":"fonts/svatopluk/Svatopluk-Medium-iF67d6f0d9a273f.otf","weight":500,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-MediumItalic-iF67d6f0d9a9acb.otf","weight":500,"style":"italic"},{"file":"fonts/svatopluk/Svatopluk-SemiBold-iF67d6f0d9afd52.otf","weight":600,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-SemiBoldItalic-iF67d6f0d9bc165.otf","weight":600,"style":"italic"},{"file":"fonts/svatopluk/Svatopluk-Bold-iF67d6f0d9b5f70.otf","weight":700,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-BoldItalic-iF67d6f0d9cb39f.otf","weight":700,"style":"italic"},{"file":"fonts/svatopluk/Svatopluk-Black-iF67d6f0d9c2423.otf","weight":900,"style":"normal"},{"file":"fonts/svatopluk/Svatopluk-BlackItalic-iF67d6f0d9d18e0.otf","weight":900,"style":"italic"}]}
];

// Only add fonts that don't already exist
const newFonts = allFonts.filter(f => !existingFamilies.has(f.family));

console.log('Adding', newFonts.length, 'new fonts:', newFonts.map(f => f.family).join(', '));

if (newFonts.length === 0) {
  console.log('No new fonts to add');
  process.exit(0);
}

// Find the position to insert (after Apercu Mono)
const insertAfter = '{"family":"Apercu Mono"';
const insertPos = html.indexOf(insertAfter);
const arrayStart = html.lastIndexOf('{"fonts":[', insertPos);

// Build the new font entries string
const newFontsStr = newFonts.map(f => '    ' + JSON.stringify(f)).join(',\n') + ',\n';

// Insert the new fonts at the beginning of the fonts array
const newHtml = html.slice(0, arrayStart + '{"fonts":['.length) + '\n' + newFontsStr + html.slice(arrayStart + '{"fonts":['.length);

fs.writeFileSync('index.html', newHtml);
console.log('Successfully added ' + newFonts.length + ' fonts');
