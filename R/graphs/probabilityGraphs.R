
png(file="normalDist.png", width = 640, height = 480)
    lwd = 3
    col1 = rgb(0,0,0,0.8)
    col2 = rgb(1,0,0,0.8)
    col3 = rgb(0.5,0.1,0.5,0.8)
    col4 = rgb(0,0,1,0.8)
    plot(c(-5,5), c(0,1.7), type = "n", 
         main = "Selected Normal Distributions\n Mean = 0", 
         xlab = "Value of Random Variable", ylab = "Probability Density")
    curve({function(x){return(dnorm(x, 0, 2))}}(x),xlim=c(-5,5), lwd = lwd, lty = 1, col = col1, add = TRUE)
    curve({function(x){return(dnorm(x, 0, 1))}}(x), xlim=c(-5,5),lwd = lwd, lty = 2, col = col2, add = TRUE)
    curve({function(x){return(dnorm(x, 0, 0.5))}}(x), xlim = c(-5,5),lwd = lwd, lty = 3, col = col3, add = TRUE)
    curve({function(x){return(dnorm(x, 0, 0.25))}}(x), xlim=c(-5,5),lwd = lwd, lty = 4, col = col4, add = TRUE)
    legend(x = 2,y = 1, legend = c("SD: 2", "SD: 1", "SD: 0.5", "SD: 0.25"),
           col=c(col1, col2, col3, col4), lty = 1:4, lwd=rep(lwd, 4), cex = 1.5)
dev.off()


png(file="binomialDist.png", width = 640, height = 480)

    lwd = 3
    col1 = rgb(0,0,0,0.8)
    col2 = rgb(1,0,0,0.8)
    col3 = rgb(0.5,0.1,0.5,0.8)
    col4 = rgb(0,0,1,0.8)
    plot(c(0,12), c(0,.4), type = "n", 
         main = "Selected Binomial Distributions\n n=12", 
         xlab = "Value of Random Variable", ylab = "Probability Mass")
    xpts = 0:100

    lines(xpts, dbinom(xpts, size = 12, p = 0.2), lty=2, lwd = 1, col = "lightgrey")
    lines(xpts, dbinom(xpts, size = 12, p = 0.5), lty=2, lwd = 1, col = "lightgrey")
    lines(xpts, dbinom(xpts, size = 12, p = 0.8), lty=2, lwd = 1, col = "lightgrey")

    cex = 1.5
    points(xpts, dbinom(xpts, size = 12, p = 0.2), pch = 16, cex = cex, col= col1)
    points(xpts, dbinom(xpts, size = 12, p = 0.5), pch = 15, cex = cex, col= col2)
    points(xpts, dbinom(xpts, size = 12, p = 0.8), pch = 4, cex = cex, col= col3)



    legend(x = 6,y = 0.4, legend = c("p=0.2", "p=0.5", "p=0.8"),
           col=c(col1, col2, col3), pch = c(16,15,4), pt.cex=cex, cex = 1.5, horiz = TRUE,
           xjust=0.5)

dev.off()




