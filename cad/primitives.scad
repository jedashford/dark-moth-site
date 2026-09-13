module rounded_rect(w,d,r) {
    hull() for(x=[-1,1],y=[-1,1])
        translate([x*(w/2-r),y*(d/2-r)]) circle(r=r);
}
module prism(w,d,h,r=1) {
    linear_extrude(h) rounded_rect(w,d,r);
}
module outer_outline(inset=0) {
    translate([cx,cy]) rounded_rect(outer_w-2*inset,outer_d-2*inset,corner_r-inset);
}
module top_panel() {
    translate([0,0,iz]) linear_extrude(lid_t-edge_chamfer) outer_outline();
    hull() {
        translate([0,0,iz+lid_t-edge_chamfer]) linear_extrude(0.01) outer_outline();
        translate([0,0,iz+lid_t-0.01]) linear_extrude(0.01) outer_outline(edge_chamfer);
    }
}
module pilot(d=2.1,h=9) { cylinder(d=d,h=h); }
module fastener_bores(indices=[0,1,2,3]) {
    for(i=indices) let(p=case_holes[i]) {
        translate([p[0],p[1],iz-2]) cylinder(d=2.8,h=lid_t+3);
        translate([p[0],p[1],iz+lid_t-1.3]) cylinder(d=5.3,h=1.4);
    }
}
module moth() {
    // Same 44 path shapes as branding/assets/logo_vector.svg. No replacement mark.
    // Deboss keeps tiny facets attached to the lid; coupon exposes resolution limits.
    resize([logo_w,0],auto=true) import("moth.svg",center=true);
}
module bay(x,y,w,d,h=3,right=true) {
    t=1.2;
    c=0.5;
    for(s=[0,1]) {
        translate([x-c-t,y+(s ? d+c : -c-t),0]) cube([7,t,h]);
        translate([x-c-t,y+(s ? d+c-7 : -c),0]) cube([t,7,h]);
        if(right) {
            translate([x+w+c-6,y+(s ? d+c : -c-t),0]) cube([7,t,h]);
            translate([x+w+c,y+(s ? d+c-7 : -c),0]) cube([t,7,h]);
        }
    }
}
