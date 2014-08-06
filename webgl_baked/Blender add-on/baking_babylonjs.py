# written by Glenn De Backer <glenn@simplicity.be> 

bl_info = {
    "name": "Baking BaylonJS",
    "category": "Material",
}

import bpy
import os


class BakingBabylonJS(bpy.types.Operator):
    """Baking BaylonJS"""      					# blender will use this as a tooltip for menu items and buttons.
    bl_idname = "object.baking_babylonjs"       # unique identifier for buttons and menu items to reference.
    bl_label = "Baking BabylonJS"     			# display name in the interface.
    bl_options = {'REGISTER', 'UNDO'}  			# enable undo for the operator.

    def execute(self, context):        			# execute() is called by blender when running the operator.

        # The original script
        scene = context.scene
        
        # go through each object in the scene
        for obj in scene.objects:

            #check if object is type mesh  
            if obj.type == "MESH":
                
                baked_image_found = False
                image_path = None
                
                # check if object has material
                if obj.active_material != None:
                    
                    # get material
                    mat = obj.active_material
                    
                    # check if material uses nodes
                    if mat.use_nodes == True :
                       
                        # store object name
                        object_name = obj.name.lower()
                        
                        # iterate through nodes
                        for n in mat.node_tree.nodes:
                            
                            # if type is texture image
                            if n.bl_static_type == "TEX_IMAGE":
                              
                                # check outbound connections
                                for o in n.outputs:     
                                    # if connection is color    
                                    if o.name == "Color":
                                        
                                        # look for an empty image texture (baking target)
                                        # check number of connections
                                        if len(o.links) == 0:
                                            # set baked image has been found flag
                                            baked_image_found = True
                                
                                            # check if image has been defined
                                            if n.image != None:
                                                # store image path 
                                                image_path = n.image.filepath
                                                
                        # check if baked_image has been found and image has been defined                                                        
                        if  baked_image_found and image_path != None:
                            
                            # create new material
                            mat = self.createNewMaterial(object_name, image_path)
                                                                              
                            # assign material to object
                            obj.active_material = mat
                            
                            # set baked image flag to false
                            baked_image_found = False
                            
        # get current directory
        filepath = bpy.data.filepath
        directory = os.path.dirname(filepath)

        # store as other blend file so we keep the original
        newfile_name = os.path.join( directory , "export_babylonjs.blend")
        bpy.ops.wm.save_mainfile(filepath=newfile_name)
                
        return {'FINISHED'}            # this lets blender know the operator finished successfully.


    #
    # Creates new material that the babylonjs exporter can export
    #
    def createNewMaterial(self, object_name, image_path):
        
        if image_path != None:
        
            # output to console
            print("creating new material for object : " + object_name)  
            
            # create new material
            newMat = bpy.data.materials.new("mat_"+ object_name)
            
            # set specularity to zero
            newMat.specular_intensity = 0.0
            
            # set emmission
            newMat.emit = 1.0
            
            # load image
            try:
                img = bpy.data.images.load(image_path)
            except:
                raise NameError("Cannot load image %s" % realpath)
                
            # creates image texture
            imgTex       = bpy.data.textures.new('ColorTex', type = 'IMAGE')
            imgTex.image = img
            
            # create new slot
            mtex = newMat.texture_slots.add()
            
            # assign image
            mtex.texture = imgTex
            
            # set uv coordinates
            mtex.texture_coords = 'UV'
                        
            # return material
            return newMat
            


def register():
    bpy.utils.register_class(BakingBabylonJS)


def unregister():
    bpy.utils.unregister_class(BakingBabylonJS)


# This allows you to run the script directly from blenders text editor
# to test the addon without having to install it.
if __name__ == "__main__":
    register()








