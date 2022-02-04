import sys
def compareFiles(filePath1, filePath2):
    file1=open(filePath1, 'r')
    file2=open(filePath2, 'r')
    string1=file1.read()
    string2=file2.read()
    list1=string1.split()
    list2=string2.split()
    if(len(list1) != len(list2)):
        return False
    for i in range(len(list1)):
        if(list1[i] != list2[i]):
            break
    else:
        return True
    return False

if __name__ == '__main__':
    args=sys.argv
    file1=args[1]
    file2=args[2]
    if(compareFiles(file1, file2)):
        print("AC")
    else:
        print("WA")
