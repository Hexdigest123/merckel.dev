# Elektro-Segler-Rumpf (FreeCAD)

3D-gedruckter Rumpf eines Elektro-Seglers (Spannweite 1,5–1,8 m, LW-PLA), erzeugt mit FreeCAD 1.1.4.

## Dateien

| Datei | Inhalt |
|---|---|
| `ElektroSegler_Rumpf.FCStd` | FreeCAD-Dokument mit zwei Festkörpern: `Segment1_Nase`, `Segment2_Heck` |
| `rumpf_makro.py` | Makro, das das Dokument aus dem Parameter-Dictionary `P` neu aufbaut (Wahrheit liegt im Makro) |
| `Segment1_Nase.stl` / `Segment2_Heck.stl` | STL-Export beider Segmente (Slicer-Vorschau) |

## Geometrie

- Rumpflänge 560 mm, x = 0 an der Nase, positiver x nach hinten; y quer, z hoch
- Außenkontur: Loft über Ellipsenquerschnitte an 7 Stationen; Höhlung = identischer Loft ab x = 25 mit 0,9 mm Wand (Innen-Loft per `cut`, kein Shell)
- Motorbohrung Ø 30 (x −2 bis 26), Flügelsattel (x 100–210), Bodenöffnung (x 90–260), Heckrohr Ø 10,3 (x 480–565), 2× Klemmlöcher Ø 3,2 (x 540, y ±8,15), Segmentfuge bei x = 270, Stiftbohrungen Ø 3,3 (x 257–283, y ±7)

## Verifikation (FreeCAD 1.1.4, headless + Reopen)

- Beide Segmente `isValid() = True`, je 1 Solid
- `Segment1_Nase`: 23,91 cm³, 265,5 mm (x 4,5–270) → ~12,0 g bei 0,5 g/cm³
- `Segment2_Heck`: 27,21 cm³, 290,0 mm (x 270–560) → ~13,6 g bei 0,5 g/cm³
- Alle Bohrungen/Öffnungen per Schnittproben verifiziert; STL-Export getestet

## Bekannte Einschränkungen (Maße exakt wie spezifiziert)

1. Mit 560 mm Gesamtlänge und einer Fuge bei x = 270 sind beide Segmente zwangsläufig länger als 250 mm (265,5 / 290 mm). Segment 2 passt nicht flach auf ein 256-mm-Bett — dafür wären 3 Segmente oder ein kürzerer Rumpf nötig.
2. Die Stiftbohrungen bei y = ±7, z = 0 liegen im Hohlraum (Innenhalbbreite an der Fuge ≈ ±17,7 mm) und schneiden kein Material. Für Bohrungen durch die Seitenwand müsste y ≈ ±18,2 mm sein (in `P["stifte"]["y_abstand"]` änderbar).
3. Die Ø-30-Motorbohrung entfernt die Nase (26×28 mm an der Spitze) nahezu vollständig; Segment 1 beginnt daher erst bei x ≈ 4,5 und ist etwas leichter als das Hecksegment.

## Nutzung

`ElektroSegler_Rumpf.FCStd` in FreeCAD 1.x öffnen, Segmente markieren, Datei → Export → STL. Parameter-Änderungen nur in `P` in `rumpf_makro.py` vornehmen und Makro neu ausführen (Makro → Makros… → Ausführen).
