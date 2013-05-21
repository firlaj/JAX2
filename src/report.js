JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.show = function(type, func, msg, node) {
	if (console[type]) {
		console[type]("[" + func + "] » " + msg);
		if (node) {
			console.log("[JAX found problemt with node:");
			console.log(node);
		}
	}
	throw new Error("Bad console type: " + type); 
};
