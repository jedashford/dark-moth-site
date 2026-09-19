module body() {
    difference() {
        union() {
            difference() {
                // Bottom bevel reduces elephant-foot interference at exterior corners.
                hull() {
                    translate([0,0,-floor_t]) linear_extrude(0.01) outer_outline(0.4);
                    translate([0,0,-floor_t+0.4]) linear_extrude(0.01) outer_outline();
                }
                translate([-200,-200,0]) cube([400,400,200]);
            }
            translate([0,0,-floor_t+0.4]) linear_extrude(iz+floor_t-0.4) outer_outline();
        }
        translate([cx,cy,0]) prism(ix,iy,iz+1,corner_r-wall);
        // Open at top: the separately printed rail closes the window, no 100 mm bridge.
        translate([cx-window_w/2,-wall-1,window_bottom]) cube([window_w,wall+3,iz]);
        // Side and bottom channel, open upward for extraction of a rigid sheet.
        translate([cx-(sheet_w+slot_clear)/2,sheet_y,sheet_z])
            cube([sheet_w+slot_clear,sheet_t+slot_clear,iz]);
        translate([-wall-0.1,charge_y-charge_w/2,charge_z-charge_h/2])
            cube([wall+0.2,charge_w,charge_h]);
        button_opening();
        // Blind pilots continue into the floor; retain 0.6 mm exterior skin.
        for(p=concat(tray_mounts,tier_mounts,battery_mounts,connector_mounts))
            translate([p[0],p[1],-1.8]) cylinder(d=1.7,h=1.9);
    }
    control_cradle();
    // Rear faces of diffuser guides: 2 mm engagement each edge, 1.2 mm wall.
    for(s=[-1,1])
        translate([cx+s*(sheet_w/2-0.7)-1.3,sheet_y+sheet_t+slot_clear,0])
            cube([2.6,1.2,window_top-fit]);
    // Positive lower stop: protects sheet from dropping into the enclosure.
    translate([cx-sheet_w/2,sheet_y+sheet_t+slot_clear,0]) cube([sheet_w,1.2,sheet_z]);
    // Full-height screw bosses are rooted in the floor, not suspended overhangs.
    for(p=case_holes) translate([p[0],p[1],0]) difference() {
        cylinder(r=3.5,h=iz);
        translate([0,0,iz-10]) pilot(h=10.1);
    }
    product_body_mounts();
    // LED mounting rib: retained ahead of the PCB to avoid its front edge.
    difference() {
        translate([cx-50,rib_y,0]) cube([100,2,rib_h]);
        translate([cx-50-0.1,rib_y-0.1,0]) cube([9,2.2,9]);
        translate([cx+40,rib_y-0.1,0]) cube([10.1,2.2,9]);
    }
}
module lid() {
    difference() {
        union() {
            intersection() {
                top_panel();
                translate([-10,rail_end+seam,0]) cube([140,120,50]);
            }
            // Perimeter locating lip, inset from the sidewalls.
            intersection() {
                translate([cx,cy,iz-lap_h]) difference() {
                    prism(ix-2*fit,iy-2*fit,lap_h+0.05,1.6);
                    translate([0,0,-0.1]) prism(ix-3,iy-3,lap_h+0.3,0.6);
                }
                translate([-10,rail_end+seam+fit,0]) cube([140,120,50]);
            }
        }
        translate([cx,logo_y,iz+lid_t-logo_depth]) linear_extrude(logo_depth+0.1) moth();
        fastener_bores([2,3]);
        // Clear locating lip around case bosses.
        for(p=case_holes) translate([p[0],p[1],iz-lap_h-0.1]) cylinder(d=7.6,h=lap_h+0.1);
    }
}
module rail() {
    difference() {
        union() {
            intersection() {
                top_panel();
                translate([-10,-10,0]) cube([140,rail_end+10,50]);
            }
            // Front lintel prints upward from rail top on the bed.
            translate([cx-window_w/2,-wall,window_top])
                cube([window_w,wall+sheet_y,iz-window_top+0.05]);
            // Lower ceiling retains the unchanged-height sheet in the taller R6 rail.
            translate([cx-sheet_w/2,sheet_y,sheet_z+sheet_h+fit])
                cube([sheet_w,sheet_t+slot_clear,iz-sheet_z-sheet_h-fit+0.05]);
            // Rear keeper traps the top of the sheet without tape or glue.
            translate([cx-sheet_w/2,sheet_y+sheet_t+slot_clear,window_top])
                cube([sheet_w,1.2,iz-window_top+0.05]);
        }
        fastener_bores([0,1]);
        for(i=[0,1]) let(p=case_holes[i])
            translate([p[0],p[1],window_top-0.1]) cylinder(d=7.6,h=iz-window_top+0.1);
        // 0.25 vertical play, no hard clamp on acrylic.
        translate([cx-(sheet_w+slot_clear)/2,sheet_y,sheet_z+sheet_h])
            cube([sheet_w+slot_clear,sheet_t+slot_clear,fit]);
    }
}
