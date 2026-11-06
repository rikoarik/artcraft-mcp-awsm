export const craftNames = ["figcraft", "solidcraft", "cadcraft", "materialcraft", "texturecraft"] as const;
export type Craft = typeof craftNames[number];
export const isCraft = (name:string):name is Craft => (craftNames as readonly string[]).includes(name);
const figTools=["inspect_document","get_node","create_node","set_properties","batch","run_command","list_commands","screenshot","export","save_file","inspect_ui","select_nodes"];
const solidTools=["list_commands","describe_command","skill_reference","inspect_design","measure","body_topology","screenshot","running","pending","execute","batch","set_parameter","undo","redo","save","export"];
const cadTools=["list_commands","inspect_drawing","query_entities","find_text","render","execute","command_line","script","save","cancel"];
export const adapters = {
 figcraft:{flag:"--attach",inspect:"inspect_document",tools:figTools,focused:["inspect_document","get_node","create_node","set_properties","batch","screenshot","inspect_ui","select_nodes"],phase:"screens"},
 solidcraft:{flag:"--connect",inspect:"inspect_design",tools:solidTools,focused:["inspect_design","execute","batch","set_parameter","measure","screenshot"],phase:"modeling"},
 cadcraft:{flag:"--connect",inspect:"inspect_drawing",tools:cadTools,focused:["inspect_drawing","query_entities","execute","render"],phase:"screens"},
 materialcraft:{flag:"--bridge",inspect:"session_inspect",tools:["session_inspect","command_list","command_run","command_batch","library_list","graph_new","node_add","node_connect","node_param","package_save","outputs_export","material_export","view_render","view_screenshot","ui_screenshot","ui_inspect"],focused:["session_inspect","command_list","library_list","node_add","node_connect","node_param","command_batch","view_screenshot","ui_inspect"],phase:"materials"},
 texturecraft:{flag:"--bridge",inspect:"session_inspect",tools:["session_inspect","command_list","command_run","command_batch","project_save","mesh_reimport","mesh_export","material_save","material_load","textures_export","bake","paint_stroke","viewport_render","viewport_screenshot","ui_screenshot","ui_inspect"],focused:["session_inspect","command_list","command_run","command_batch","paint_stroke","bake","viewport_screenshot","ui_inspect"],phase:"texturing"},
} as const;
export function attachedEndpoint(craft:Craft,args:readonly string[]):string|undefined {
 const flag=adapters[craft].flag;
 const index=args.indexOf(flag);
 if(index>=0){if(!args[index+1])throw new Error("Missing endpoint after "+flag);return args[index+1];}
 return args.find(a=>a.startsWith(flag+"="))?.slice(flag.length+1);
}
