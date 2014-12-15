


sizeBeta = 1
sizeBeta2 = -0.8
priceBeta = -1
priceBeta2 = -0.5
interaction = 1
interaction2 = 0.05
beta = c(sizeBeta, sizeBeta2, priceBeta, priceBeta2, interaction, interaction2)


sizes = seq(1,10, 0.1) - 5
prices = seq(0,20,length=length(sizes)) - 10
X = expand.grid(sizes, prices)
X = cbind(X[,1], X[,1]^2, X[,2], X[,2]^2, X[,1]*X[,2], X[,1]*X[,2]*X[,2])

eta = matrix(X %*% beta, nrow = length(sizes), ncol = length(prices))
eta = eta[(nrow(eta):1),(ncol(eta)):1]



png(file = "./priceSizePlot.png", width = 640, height =350)
    invLogit = function(x){exp(x)/(1+exp(x))}
    image.plot(invLogit(eta), xlab = "Size", ylab = "Price", main = "Hypothetical True Purchase Probability for Population")
dev.off()



sizeBeta = 0
sizeBeta2 = -0.8
priceBeta = -1
priceBeta2 = -1
interaction = -1
interaction2 = 0.0
beta = c(sizeBeta, sizeBeta2, priceBeta, priceBeta2, interaction, interaction2)


sizes = seq(1,10, 0.1) - 5
prices = seq(0,20,length=length(sizes)) - 2 
X = expand.grid(sizes, prices)
X = cbind(X[,1], X[,1]^2, X[,2], X[,2]^2, X[,1]*X[,2], X[,1]*X[,2]*X[,2])

eta = matrix(X %*% beta, nrow = length(sizes), ncol = length(prices))
eta = eta[(nrow(eta):1),(ncol(eta)):1]



png(file = "./priceSizePlot2.png", width = 640, height =350)
    invLogit = function(x){exp(x)/(1+exp(x))}
    image.plot(invLogit(eta), xlab = "Size", ylab = "Price", main = "Hypothetical True Purchase Probability for Population")
dev.off()





#par(xaxt = "s")
#par(yaxt="s")
#axis(side=1, at = sizes, labels = 100*floor(sizes + 5))
#axis(side=2, at = prices, labels = floor(prices*100))




