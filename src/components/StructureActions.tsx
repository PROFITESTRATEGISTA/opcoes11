@@ .. @@
         {structure.status === 'MONTANDO' && (
           <>
-            <button
-              onClick={() => onActivate(structure)}
-              className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
-            >
-              <Upload className="w-3 h-3 mr-1" />
-              Ativar
-            </button>
             <button
               onClick={() => onEdit(structure)}
               className="px-3 py-2 text-blue-400 hover:text-blue-300 text-xs border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center"
             >
               <Edit2 className="w-3 h-3 mr-1" />
               Editar
             </button>
+            <button
+              onClick={() => onActivate(structure)}
+              className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
+            >
+              <Target className="w-3 h-3 mr-1" />
+              Ativar
+            </button>
           </>
         )}
         
@@ .. @@
             <button
-              onClick={() => onZero(structure)}
+              onClick={() => onZero(structure)}
               className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
             >
-              Zerar
+              Fechar Operação
             </button>
           </>
         )}