// openscad -o body.stl -D 'part="body"' cad/enclosure.scad
// Print exports sit on Z=0. assembly=true retains original assembly coordinates.
include <dimensions.scad>
include <primitives.scad>
include <shell.scad>
include <control.scad>
$fn=64;
part="all";
assembly=false;
assert(sheet_w > window_w+2 && sheet_w+slot_clear < ix);
assert(sheet_t >= 1 && sheet_t <= 3.2, "Supported sheet thickness is 1–3.2 mm; rebuild and verify.");
assert(sheet_y+sheet_t+slot_clear <= case_holes[0][1]-3.5, "Diffuser channel must clear front screw bosses.");
assert(key_tip > carrier_bottom+carrier_t+remote_pcb_t+switch_h);
assert(cradle_top < iz-lap_h, "Side control cradle must clear the lid lip.");
assert(key_y-cradle_outer > by+bd, "Side control cradle must sit behind the main PCB.");
module select_part() {
    if(part=="body") body();
    else if(part=="lid") lid();
    else if(part=="rail") rail();
    else if(part=="button") button();
    else if(part=="switch_carrier") switch_carrier();
    else if(part=="diffuser") diffuser();
    else if(part=="coupon") coupon();
}
if(part=="all") {
    color("#242629") body();
    color("#191b1d") lid();
    color("#191b1d") rail();
    color("#333638") button();
    color("#303235") switch_carrier();
    color([0.08,0.08,0.08,0.7]) diffuser();
} else if(assembly || part=="coupon") select_part();
else if(part=="body") translate([wall,wall,floor_t]) select_part();
else if(part=="lid" || part=="rail")
    translate([wall,iy+wall,iz+lid_t]) rotate([180,0,0]) select_part();
else if(part=="button")
    translate([key_flange_w/2,key_flange_d/2,wall+key_proud]) rotate([180,0,0]) button_local();
else if(part=="switch_carrier")
    translate([carrier_w/2,carrier_d/2,-carrier_bottom]) switch_carrier_local();
else if(part=="diffuser") cube([sheet_w,sheet_h,sheet_t]);
