P = {
    "dokument_name": "ElektroSegler_Rumpf",
    "stationen": [
        (0.0, 26.0, 28.0),
        (25.0, 34.0, 38.0),
        (90.0, 44.0, 52.0),
        (220.0, 40.0, 46.0),
        (400.0, 30.0, 36.0),
        (500.0, 20.0, 24.0),
        (560.0, 20.0, 24.0),
    ],
    "wand": 0.9,
    "min_innen": 4.0,
    "hohlung_ab_x": 25.0,
    "motor_bohrung": {"durchmesser": 30.0, "x0": -2.0, "x1": 26.0, "y": 0.0, "z": 0.0},
    "fluegelsattel": {"x0": 100.0, "x1": 210.0, "y0": -18.0, "y1": 18.0, "z0": 10.0, "z1": 60.0},
    "boden_oeffnung": {"x0": 90.0, "x1": 260.0, "y0": -14.0, "y1": 14.0, "z0": -60.0, "z1": -8.0},
    "heckrohr": {"durchmesser": 10.3, "x0": 480.0, "x1": 565.0, "y": 0.0, "z": 0.0},
    "klemmung": {"durchmesser": 3.2, "x": 540.0, "y_abstand": 8.15, "z0": -30.0, "z1": 30.0},
    "fuge_x": 270.0,
    "stifte": {"durchmesser": 3.3, "y_abstand": 7.0, "z": 0.0, "x0": 257.0, "x1": 283.0},
    "ueberstand": 50.0,
    "dichte_g_cm3": 0.5,
    "farbe_seg1": (0.75, 0.78, 0.85),
    "farbe_seg2": (0.95, 0.65, 0.30),
}

App = None
Part = None


def _lade_freecad():
    global App, Part
    if App is None:
        import FreeCAD as _App
        import Part as _Part
        App = _App
        Part = _Part


def querschnitt(x, breite, hoehe):
    _lade_freecad()
    c = App.Vector(x, 0.0, 0.0)
    s1 = App.Vector(x, 0.0, hoehe / 2.0)
    s2 = App.Vector(x, breite / 2.0, 0.0)
    return Part.Wire([Part.Ellipse(s1, s2, c).toShape()])


def loft(stationen):
    _lade_freecad()
    wires = [querschnitt(x, b, h) for (x, b, h) in stationen]
    return Part.makeLoft(wires, True, False)


def box(x0, x1, y0, y1, z0, z1):
    _lade_freecad()
    return Part.makeBox(x1 - x0, y1 - y0, z1 - z0, App.Vector(x0, y0, z0))


def x_zylinder(x0, x1, radius, y, z):
    _lade_freecad()
    return Part.makeCylinder(radius, x1 - x0, App.Vector(x0, y, z), App.Vector(1.0, 0.0, 0.0))


def z_zylinder(x, y, z0, z1, radius):
    _lade_freecad()
    return Part.makeCylinder(radius, z1 - z0, App.Vector(x, y, z0), App.Vector(0.0, 0.0, 1.0))


def innen_stationen():
    w = P["wand"]
    m = P["min_innen"]
    return [
        (x, max(b - 2.0 * w, m), max(h - 2.0 * w, m))
        for (x, b, h) in P["stationen"]
        if x >= P["hohlung_ab_x"]
    ]


def koerper_bauen():
    aussen = loft(P["stationen"])
    innen = loft(innen_stationen())
    k = aussen.cut(innen)
    m = P["motor_bohrung"]
    k = k.cut(x_zylinder(m["x0"], m["x1"], m["durchmesser"] / 2.0, m["y"], m["z"]))
    s = P["fluegelsattel"]
    k = k.cut(box(s["x0"], s["x1"], s["y0"], s["y1"], s["z0"], s["z1"]))
    b = P["boden_oeffnung"]
    k = k.cut(box(b["x0"], b["x1"], b["y0"], b["y1"], b["z0"], b["z1"]))
    h = P["heckrohr"]
    k = k.cut(x_zylinder(h["x0"], h["x1"], h["durchmesser"] / 2.0, h["y"], h["z"]))
    kl = P["klemmung"]
    for richtung in (-1.0, 1.0):
        k = k.cut(z_zylinder(kl["x"], richtung * kl["y_abstand"], kl["z0"], kl["z1"], kl["durchmesser"] / 2.0))
    return k


def segmente_bauen():
    k = koerper_bauen()
    u = P["ueberstand"]
    x_min = P["stationen"][0][0] - u
    x_max = P["stationen"][-1][0] + u
    y_r = max(b for (_, b, _) in P["stationen"]) / 2.0 + u
    z_r = max(h for (_, _, h) in P["stationen"]) / 2.0 + u
    f = P["fuge_x"]
    seg1 = k.common(box(x_min, f, -y_r, y_r, -z_r, z_r))
    seg2 = k.common(box(f, x_max, -y_r, y_r, -z_r, z_r))
    st = P["stifte"]
    for richtung in (-1.0, 1.0):
        zyl = x_zylinder(st["x0"], st["x1"], st["durchmesser"] / 2.0, richtung * st["y_abstand"], st["z"])
        seg1 = seg1.cut(zyl)
        seg2 = seg2.cut(zyl)
    return seg1, seg2


def farbe_setzen(obj, farbe):
    if hasattr(obj, "ViewObject") and obj.ViewObject is not None:
        try:
            obj.ViewObject.ShapeColor = farbe
        except Exception:
            pass


def main(datei=None):
    _lade_freecad()
    doc = App.newDocument(P["dokument_name"])
    seg1, seg2 = segmente_bauen()
    o1 = doc.addObject("Part::Feature", "Segment1")
    o1.Label = "Segment1_Nase"
    o1.Shape = seg1
    o2 = doc.addObject("Part::Feature", "Segment2")
    o2.Label = "Segment2_Heck"
    o2.Shape = seg2
    doc.recompute()
    farbe_setzen(o1, P["farbe_seg1"])
    farbe_setzen(o2, P["farbe_seg2"])
    for o in (o1, o2):
        try:
            bb = o.Shape.optimalBoundingBox()
        except Exception:
            bb = o.Shape.BoundBox
        laenge_mm = bb.XLength
        volumen_cm3 = o.Shape.Volume / 1000.0
        masse_g = volumen_cm3 * P["dichte_g_cm3"]
        gueltig = o.Shape.isValid()
        App.Console.PrintMessage(
            "%s: gueltig=%s Laenge=%.1f mm Volumen=%.2f cm3 Masse~%.1f g (Dichte %.2f g/cm3)\n"
            % (o.Label, gueltig, laenge_mm, volumen_cm3, masse_g, P["dichte_g_cm3"])
        )
    if datei:
        doc.saveAs(datei)
        App.Console.PrintMessage("Gespeichert: %s\n" % datei)
    return doc


if __name__ == "__main__":
    main()
