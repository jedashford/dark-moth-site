module control_frame() {
    translate([key_x,key_y,key_z]) rotate([0,-90,0]) children();
}
module button_local() {
    // Captive between the sidewall and carrier; press toward local -w / global +X.
    translate([0,0,-key_flange_t]) prism(key_flange_w,key_flange_d,key_flange_t,3);
    translate([0,0,-0.01]) prism(key_w,key_d,wall+key_proud+0.01,3.3);
    translate([0,0,key_tip]) cylinder(d=3,h=-key_flange_t-key_tip+0.05);
}
module button() { control_frame() button_local(); }
module button_opening() {
    control_frame() translate([0,0,-0.1])
        prism(key_w+2*fit,key_d+2*fit,wall+0.2,3.5);
}
module switch_carrier_local() {
    difference() {
        union() {
            translate([0,0,carrier_bottom]) prism(carrier_w,carrier_d,carrier_t,2);
            // Slide a 12 mm daughterboard under these retaining lips from either end.
            // Body cradle rails close the ends when this carrier is screwed in place.
            for(s=[-1,1]) {
                translate([s*6.85-0.6,-6,carrier_bottom+carrier_t-0.02])
                    cube([1.2,12,2.02]);
                translate([s > 0 ? 5.5 : -7.45,-5,carrier_bottom+carrier_t+remote_pcb_t+0.1])
                    cube([1.95,10,0.5]);
                // Hard stops under key flange; key_travel sets maximum inward motion.
                translate([s*6.85-0.6,-2,carrier_bottom+carrier_t-0.02])
                    cube([1.2,4,key_stop-carrier_bottom-carrier_t+0.02]);
            }
        }
        for(u=[-mount_offset,mount_offset]) translate([u,0,carrier_bottom-0.1])
            cylinder(d=2.3,h=carrier_t+0.2);
        // Lead/solder clearance below the center, board rests at its edges.
        translate([-4.5,-6.1,carrier_bottom-0.1]) cube([9,12.2,carrier_t+0.2]);
    }
}
module switch_carrier() { control_frame() switch_carrier_local(); }
module control_cradle() {
    // Floor-rooted rails support a 12.5 mm bridge above the key, keeping overhangs
    // short without blocking the plunger or electronics. Pilot bores face inward.
    difference() {
        union() {
            for(s=[-1,1]) translate([-0.2,key_y+(s>0 ? cradle_inner : -cradle_outer),-0.1])
                cube([cradle_depth+0.2,cradle_outer-cradle_inner,cradle_top+0.1]);
            translate([-0.2,key_y-cradle_inner,-0.1])
                cube([cradle_depth+0.2,2*cradle_inner,key_z-mount_offset+mount_radius+0.1]);
            translate([-0.2,key_y-cradle_inner,key_z+mount_offset-mount_radius])
                cube([cradle_depth+0.2,2*cradle_inner,2*mount_radius]);
        }
        for(z=[key_z-mount_offset,key_z+mount_offset])
            translate([cradle_depth+0.1,key_y,z]) rotate([0,-90,0]) cylinder(d=1.7,h=6.3);
    }
}
module diffuser() {
    translate([cx-sheet_w/2,sheet_y,sheet_z]) cube([sheet_w,sheet_t,sheet_h]);
}
module coupon() {
    difference() {
        translate([0,0,0]) prism(58,52,2.4,3);
        // Match the lid's bed-facing 0.5 mm recess, including its printed Y flip.
        // Slot banks stay upright; inspect the moth on the underside after printing.
        translate([0,4,-0.1]) linear_extrude(logo_depth+0.1)
            mirror([0,1,0]) moth();
    }
    // Slot bank: insert a corner of real stock; nominal thickness + 0.2/0.4/0.6.
    for(i=[0:2]) translate([-23+i*17,-23,2.4]) difference() {
        cube([14,8,8]);
        translate([1,2,2]) cube([12,sheet_t+0.2+i*0.2,7]);
    }
}
