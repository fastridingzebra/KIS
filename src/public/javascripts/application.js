document.observe('dom:loaded', function () {

    /*
     * toggle for fieldsets
     */
    var fieldset = $$('fieldset.collapsible');
    var fieldsetLink = $$('fieldset legend a');
    var fieldsetContent = $$('fieldset .fieldset-content');

    fieldsetLink.each(function (fLink, intIdx) {
        fLink.observe('click', function () {
            fieldsetContent[intIdx].toggle();
            if (!fieldset[intIdx].hasClassName('collapsed')) {
                fieldset[intIdx].addClassName('collapsed');
            } else {
                fieldset[intIdx].removeClassName('collapsed');
            }
        });
    });


    /*
     * slide toggle
     * for templates
     */
    var elMainContainer = $$('.template-collapsible');
    var arrToggelButton = $$('.template-toggle-link');
    var arrToggleTarget = $$('.template-content');

    arrToggelButton.each(function (elButton, intIdx) {
        elButton.observe('click', function () {
            arrToggleTarget[intIdx].toggle();
            if (!elMainContainer[intIdx].hasClassName('collapsed')) {
                elMainContainer[intIdx].addClassName('collapsed');
            } else {
                elMainContainer[intIdx].removeClassName('collapsed');
            }
        });
    });

    /*
     * class for
     * selected fields
     */

    var checkboxes = $$('#templates tbody tr .checkbox');
    var fields = $$('#templates tbody tr');
    checkboxes.each(function (elCheckbox, i){
        elCheckbox.observe('click', function(e){
            if (elCheckbox.checked) {
                fields[i].addClassName('active');
            } else {
                fields[i].removeClassName('active');
            }

        });
    });

    /*
     * select all
     */
    var selectAll = $$('.select-all-fields');
    selectAll.each(function (elCheckbox, i){
        elCheckbox.observe('click', function(e){

            var templateToggle = elCheckbox.up().up();
            var template = templateToggle.up();
            
            var cb = templateToggle.next().descendants('tbody');
           
            var labelAll = templateToggle.down('.fields-select-all');
            var labelNone = templateToggle.down('.fields-select-none');
            
            cb.each(function (c, i){
                if (c.match('.checkbox')) {
                    if (elCheckbox.checked) {
                        c.checked = 1;
                        c.up().up().addClassName('active');
                        labelAll.hide();
                        labelNone.show();
                    } else {
                        c.checked = 0;
                        c.up().up().removeClassName('active');
                        labelAll.show();
                        labelNone.hide();
                    }
                }
                
                
            });
        });
    });

});



/*
 * Loading Bar feature ( use = render :partial => 'shared/loading_bar_element'
 * and onSubmit  callback to present loading bar) :onSubmit => "showAjaxLoadingBar()"
 */

function showAjaxLoadingBar() {
    document.getElementById('loading_ajax_image').style.display= "block"; 
}


/*
 * Catalog Library
 */

var tree;


function getIdList() {
     var msg="";
    Ext.each(nodeselection, function(node){
        if(msg.length > 0){
            msg += ',';
        }
        msg += node.substr(1);
    });
    return msg;
}

function submitTreeForm(){
    var msg=getIdList();
    Ext.get(node_result_id).set({value:msg});
}

function checkSelection(tree,parent,node) {
   if(node.leaf==true) {
    if (nodeselection.indexOf(node.id.toString())!=-1) {
                node.attributes['checked']=true;
    }
   }
}


function uncheckNodeFromTree(id) {
    nodeselection.remove(id);
    json_id_store.reload({params:{entry_ids:getIdList()}});
}

function checkNodeFromTree(id) {
    nodeselection.push(id);
    json_id_store.reload({params:{entry_ids:getIdList()}});
}

function checkNodeFromSearch(grid, records, action, groupId) {
    var node=tree.getNodeById("_"+records.id);
   
    if (node) {
        
         node.ui.toggleCheck(true);
    } else {
         
   nodeselection.push("_"+records.id);
   json_id_store.reload({params:{entry_ids:getIdList()}});
    }
}
function uncheckNodeFromSearch(grid, records, action, groupId) {
    var node=tree.getNodeById("_"+records.id);
   
    if (node) {
         node.ui.toggleCheck(false);
    } else {
    nodeselection.remove("_"+records.id);
    json_id_store.reload({params:{entry_ids:getIdList()}});
    }
}

Ext.onReady(function(){
   if (Ext.get('catalog_tree')) {
    root = new Ext.tree.AsyncTreeNode({
        text: 'Invisible Root',
        id:'0'
      });
    

    tree=new Ext.tree.TreePanel({
        renderTo: 'catalog_tree',
         root: root,
          rootVisible:false,
           border: false,
          loader: new Ext.tree.TreeLoader({
          url: "/catalogs/"+catalog_id,
          requestMethod:'GET',
          baseParams:{format:'json'}
        }) 

    });
   root.expand();

   }
   
   if (Ext.get('catalog_tree_select')) {
    root = new Ext.tree.AsyncTreeNode({
        text: 'Invisible Root',
        id:'0'
      });
    tree=new Ext.tree.TreePanel({
        autoScroll:true,
        
        title: 'Catalog XYZ',
         root: root,
          rootVisible:false,
           border: false,
          loader: new Ext.tree.TreeLoader({
          url: "/catalogs/"+catalog_id+"?checkbox=true",
          requestMethod:'GET',
          baseParams:{format:'json'}
        }),
         listeners: {
            'checkchange': function(checkedNode, checked){
                 if(!checked) {
                      uncheckNodeFromTree(checkedNode.id);
                  } else {
                      if(single_selection) {
                             Ext.each(tree.getChecked(), function(node) {
                             if(node.id != checkedNode.id) {
                               nodeselection.remove(node.id);
                                node.ui.toggleCheck(false);
                             }
                        });
                      }
                      checkNodeFromTree(checkedNode.id);
                 }
           }
         }
    });

    /**
     * Search
     */

     json_id_store=new Ext.data.Store({
        reader:new Ext.data.JsonReader({
             id:'id'
            ,totalProperty:'totalCount'
            ,root:'rows'
            ,fields:[
             {name:'id', type:'int'}
            ,{name:'name', type:'string'}
            ,{name:'description', type:'string'}
            ,{name:'code', type:'string'}
            ]})
            ,proxy:new Ext.data.HttpProxy({url:"/catalogs/getnodes/"+catalog_id})
            ,remoteSort:true
             });




    var json_search_store=new Ext.data.Store({
        reader:new Ext.data.JsonReader({
             id:'id'
            ,totalProperty:'totalCount'
            ,root:'rows'
            ,fields:[
             {name:'id', type:'int'}
                    ,{name:'name', type:'string'}
                    ,{name:'description', type:'string'}
                    ,{name:'code', type:'string'}
                            ]})
            ,proxy:new Ext.data.HttpProxy({url:"/catalogs/search/"+catalog_id})
            ,remoteSort:true
            //,autoLoad:true
            });



    var searchpanel=new Ext.extend(Ext.grid.GridPanel, {
        
        initComponent:function() {

             

            var rowAction = new Ext.ux.grid.RowActions( {
                header:"Select/Deselect",
                keepSelection:true,
                autoWidth:false,
                width:100,
                hideMode: 'display',
                actions:[
                    {iconCls:'icon-check',
                      callback:checkNodeFromSearch,
                      text: 'Check',
                      tooltip: 'Check this item'},
                    {iconCls:'icon-uncheck',
                      callback:uncheckNodeFromSearch,
                      text: 'Uncheck',
                      tooltip: 'Uncheck this item'}
                ]
            });

          

           var config = {
            title: 'Search Catalog XYZ',
            store: json_search_store,
            stripeRows:true,
            tbar:[],
            autoExpandColumn: 'auto_expander',
            colModel: new Ext.grid.ColumnModel({
                columns:[

                    new Ext.grid.Column({header:"Code", dataIndex: "code", width: 200}),
                    new Ext.grid.Column({header:"Name", dataIndex: "name", width: 200}),
                    new Ext.grid.Column({header:"Description", dataIndex: "description" , id: 'auto_expander'}),
                    rowAction
                 ]
            }),
           // autoHeight:true,
            plugins:[rowAction,new Ext.ux.grid.Search({
				disableIndexes:['description','code','name']
				,autoFocus:true
                                ,position:"top"
                                ,searchText: "Testtext"
                                ,width: "200"
                                

			})]
            }
        Ext.apply(this,config);
        Ext.apply(this.initialConfig, config);
        this.bbar = new Ext.PagingToolbar({
			 store:this.store
			,displayInfo:true
			,pageSize:20
		});

        searchpanel.superclass.initComponent.apply(this,arguments);
        
        }

    });


    /*
     * Panel Layout
     */
    var tabpanel= new Ext.TabPanel({
          border: false,
          tabPosition: 'top',
         // border:false,
          activeTab: 0,
           //flex:3,
           height:500,
           items: [tree,new searchpanel]

    });

    var selectionpanel=new Ext.grid.GridPanel({
       title: 'Selected',
       border: false,
       height:200,
       store: json_id_store,
       viewConfig: {autoFill:true, forceFit: true},
       colModel: new Ext.grid.ColumnModel({
            columns:[

                new Ext.grid.Column({header:"Code", dataIndex: "code", autoWidth:true}),
                new Ext.grid.Column({header:"Name", dataIndex: "name", autoWidth:true}),
                new Ext.grid.Column({header:"Description", dataIndex: "description", autoWidth:true})

             ]
        })
    });

   new Ext.Panel({
         renderTo: 'catalog_tree_select',
         layout:'vBox',
          height:700,
          items:[selectionpanel,tabpanel]
    });
    json_id_store.load({params:{entry_ids:getIdList()}});
   tree.on('append',checkSelection);
   root.expand();
    // Open a node path
    if( selected_node_path!="-1") {
      tree.expandPath(selected_node_path, 'id');
   }
   Ext.get(form_id).on('submit',submitTreeForm)
   }
  });